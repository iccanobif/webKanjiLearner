const axios = require('axios');
const fs = require("fs")
const go = require("./go.js").go
const pako = require("pako")
const asyncsema = require("async-sema")



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


function getNumberOfPagesFromHtml(html, letter)
{
    const regex = new RegExp(initialLetterPageBaseUrl + letter + '/[0-9]*"', 'g')

    const allPageUrls = []
    while (m = regex.exec(html))
    {
        // console.log(m[0])
        allPageUrls.push(m[0])
    }

    allPageNumbers = allPageUrls.map(url => +url.substring(url.lastIndexOf("/") + 1).replace('"', ""))
    if (allPageNumbers.length == 0)
        return 0
    return Math.max(...allPageNumbers)
}

async function downloadLemmas()
{
    const sema = new asyncsema.Sema(10)

    const letters = fs.readdirSync("letters")
    for (let i = 0; i < letters.length; i++)
    {
        const letter = letters[i]
        const html = fs.readFileSync("letters/" + letter, { encoding: "utf8" })
        const regex = new RegExp('"https://www.weblio.jp/content/.*?"', 'g')

        while (m = regex.exec(html))
        {
            const url = m[0].replace(/"/g, '')
            const fileName = "lemmas/" + url.substring(url.lastIndexOf("/") + 1)
            if (fs.existsSync(fileName))
            {
                console.log(fileName + " already exists")
                continue
            }
            await sema.acquire()
            console.log("downloading " + url)

            axios.get(url).then(response =>
            {
                console.log("Saving " + fileName)
                fs.writeFileSync(fileName, pako.gzip(response.data))
            })
            .catch(console.error)
            .finally(() => {
                sema.release()
            })
        }
    }
}

async function initializeDb()
{
    try
    {
        fs.mkdirSync("letters")
    }
    catch (_) { }
    try
    {
        fs.mkdirSync("lemmas")
    }
    catch (_) { }
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
    console.log("Downloaded everything there is to download")
    console.log("Gathering urls for all lemmas")
    await downloadLemmas()

}

initializeDb().catch(console.error)