const axios = require("axios")
const fs = require("fs")
const go = require("./go.js").go
const pako = require("pako")
const asyncsema = require("async-sema")
const mongodb = require("mongodb")
const JSSoup = require("jssoup").default


const initialLetterPageBaseUrl = "https://www.weblio.jp/category/dictionary/ssdjj/"
const initialLetters = ["aa", "ii", "uu", "ee", "oo", "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so", "ta", "chi", "tsu", "te", "to", "na", "ni", "nu", "ne", "no", "ha", "hi", "fu", "he", "ho", "ma", "mi", "mu", "me", "mo", "ya", "yu", "yo", "ra", "ri", "ru", "re", "ro", "wa", "wo", "nn", "ga", "gi", "gu", "ge", "go", "za", "zi", "zu", "ze", "zo", "da", "di", "du", "de", "do", "ba", "bi", "bu", "be", "bo", "pa", "pi", "pu", "pe", "po"]

const cartesianProduct = initialLetters.reduce((acc, val) =>
{
    return acc.concat(initialLetters.map(l => val + "-" + l))
}, [])

/*
    STEPS:
    - for each "initial letter", get its page (ex. https://www.weblio.jp/category/dictionary/aa)
    - from that page, extract the number of subpages
    - get every subpage (ex. https://www.weblio.jp/category/dictionary/aa/1)
    - from each subpage, get all the words inside (ex. https://www.weblio.jp/content/合う)
    - from each of that page, extract the content
*/

async function downloadPage(pageName)
{
    console.log("Requested download for " + pageName)
    if (fs.existsSync("letters/" + pageName.replace("/", "")))
    {
        console.log(pageName + " already downloaded")
    }
    else
    {
        console.log("starting downloading " + pageName)
        const url = initialLetterPageBaseUrl + pageName

        let response = await axios.get(url)
        console.log("done downloading " + pageName)
        fs.writeFileSync("letters/" + pageName.replace("/", ""), response.data)
    }
}

async function downloadLetterPages()
{

    try
    {
        fs.mkdirSync("letters")
    }
    catch (_) { _ }
    try
    {
        fs.mkdirSync("lemmas")
    }
    catch (_) { _ }
    await go(cartesianProduct, 40, 150, downloadPage)
    console.log("First run finished, finding extra pages to download...")
    const otherPagesToDownload = cartesianProduct.reduce((acc, val) =>
    {
        const html = fs.readFileSync("letters/" + val.replace("/", ""), { encoding: "utf8" })
        const numPages = getNumberOfPagesFromHtml(html, val)
        for (let i = 2; i <= numPages; i++)
            acc.push(val + "/" + i)
        return acc
    }, []).sort()

    console.log("Downloading extra pages...")
    await go(otherPagesToDownload, 50, 150, downloadPage)
}

function getNumberOfPagesFromHtml(html, letter)
{
    const regex = new RegExp(initialLetterPageBaseUrl + letter + '/[0-9]*"', 'g')

    const allPageUrls = []
    let m
    while ((m = regex.exec(html)))
    {
        // console.log(m[0])
        allPageUrls.push(m[0])
    }

    const allPageNumbers = allPageUrls.map(url => +url.substring(url.lastIndexOf("/") + 1).replace('"', ""))
    if (allPageNumbers.length == 0)
        return 0
    return Math.max(...allPageNumbers)
}

async function downloadLemmas()
{
    console.log("Downloading all lemma pages to db")
    const conn = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    try
    {
        const db = conn.db("webKanjiLookup")
        const sanseidoCollection = db.collection("sanseido")
        sanseidoCollection.createIndex({ urlId: 1 }, { unique: true })

        const sema = new asyncsema.Sema(40)

        const letters = fs.readdirSync("letters")
        for (let i = 0; i < letters.length; i++)
        {
            const letter = letters[i]
            const html = fs.readFileSync("letters/" + letter, { encoding: "utf8" })
            const regex = new RegExp('"https://www.weblio.jp/content/.*?"', "g")

            let m
            while ((m = regex.exec(html)))
            {
                const url = m[0].replace(/"/g, '')
                const urlId = url.substring(url.lastIndexOf("/") + 1)

                if (await sanseidoCollection.findOne({ urlId: urlId }))
                {
                    // console.log(urlId + " is already in db")
                    continue
                }


                await sema.acquire()
                console.log("downloading " + url)

                axios.get(url).then(async response =>
                {
                    console.log("Saving " + urlId)
                    await sanseidoCollection.insertOne({ urlId: urlId, gzippedData: pako.gzip(response.data) }) // old urlId: fileName
                })
                    .catch(console.error)
                    .finally(() =>
                    {
                        sema.release()
                    })
            }
        }
    }
    finally
    {
        conn.close()
    }
}

function getKijiTextFromGzippedHtml(gzippedHtml)
{
    const html = new TextDecoder("utf-8").decode(pako.ungzip(gzippedHtml))
    const soup = new JSSoup(html)
    const kiji = soup.findAll("div", "kiji")[0]
    if (kiji)
        return kiji.toString()
    else
        return kiji
}

async function saveKijiText()
{
    console.log("Extracting Kiji texts")
    const conn = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    try
    {
        const db = conn.db("webKanjiLookup")
        const sanseidoCollection = db.collection("sanseido")
        const cursor = sanseidoCollection.find({ kijiText: null })
        let noKijiCount = 0
        let yesKijiCount = 0
        while (await cursor.hasNext())
        {
            const doc = await cursor.next()
            if (!doc.gzippedData.buffer)
            {
                console.log(doc._id + " is anomalous")
            }
            const kijiText = getKijiTextFromGzippedHtml(doc.gzippedData.buffer
                ? doc.gzippedData.buffer
                : doc.gzippedData)
            if (kijiText)
            {
                yesKijiCount++
                await sanseidoCollection.updateOne({ _id: doc._id }, { $set: { kijiText: kijiText } })
                if (yesKijiCount % 100 == 0)
                    console.log("yes kiji: " + yesKijiCount)
            }
            else
            {
                noKijiCount++
                console.log(noKijiCount + " File: " + doc.urlId + " has no kiji")
            }
        }
        console.log("son qui")
        cursor.close()
    }
    finally
    {
        console.log("e pure qui")
        await conn.close()
    }

}

async function extractKeysFromKijiHtml()
{

    const conn = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    try
    {
        const db = conn.db("webKanjiLookup")
        const sanseidoCollection = db.collection("sanseido")
        sanseidoCollection.createIndex({ midashigo: 1 })
        const cursor = sanseidoCollection.find({ midashigo: null, kijiText: { $exists: true } })
        let i = 0
        while (await cursor.hasNext())
        {
            i++
            const doc = await cursor.next()
            const html = doc.kijiText
            if (html)
            {
                const soup = new JSSoup(html)
                const midashigo = soup.findAll("h2", "midashigo")[0]

                const b = midashigo.findAll("b")[0]
                const partInB = b
                    ? b.text
                        .replace(/\s*<span.*?<\/span>\s*/g, "")
                        .replace(/（.*?）/g, "")
                        .replace(/[・ ]/g, "")
                    : null

                const brackets = midashigo
                    .toString()
                    .match(/【.*?】/g)

                const partsInBrackets = brackets
                    ? brackets[0]
                        .replace(/[【】〈〉]/g, "") // remove brackets and useless 〈〉that sometimes are inside the brackets
                        .replace(/\s*<span.*?<\/span>\s*/g, "")
                        .replace(/（.*?）/g, "")
                        .split("・")
                        .map(x => x.trim())
                    : null

                // TODO: 心血を注そそぐ should be 心血を注ぐ

                const title = midashigo.attrs.title

                // console.log(doc._id)
                // console.log(midashigo.toString())
                // console.log(title)
                // console.log(partsInBrackets)
                // console.log(partInB)

                const allMidashigo = Array
                    .from(new Set([title, partInB].concat(partsInBrackets))) // Remove duplicates
                    .filter(x => x) // Remove nulls and undefineds

                await sanseidoCollection.updateOne({ _id: doc._id }, { $set: { midashigo: allMidashigo } })

                if (i % 100 == 0)
                    console.log(i)
            }
        }
    }
    finally
    {
        await conn.close()
    }
}


async function initializeDb()
{
    // await downloadLetterPages()
    // await downloadLemmas()
    // await saveKijiText()
    // await extractKeysFromKijiHtml()
}

initializeDb().catch(console.error)