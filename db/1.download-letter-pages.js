const axios = require('axios');
const fs = require("fs")
const go = require("./go.js").go

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

async function downloadFromArray(arr)
{
    await go(arr, 30, async (element) =>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                if (fs.existsSync("letters/" + element.replace("/", "")))
                {
                    console.log(element + " already downloaded")
                }
                else
                {
                    console.log("inizio " + element)
                    const url = initialLetterPageBaseUrl + element

                    let response = await axios.get(url)
                    console.log("finita richiesta per " + element)
                    fs.writeFile("letters/" + element.replace("/", ""), response.data, (err) =>
                    {
                        if (err)
                            reject(err)
                    })
                }
                resolve()
            }
            catch (err)
            {
                reject(err)
            }
        })
    })
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

downloadFromArray(cartesianProduct)
    .then(() =>
    {
        console.log("sono nel final callback del primo run")
        // Get all pages for each pair of letters
        const otherPagesToDownload = cartesianProduct.reduce((acc, val) =>
        {
            const html = fs.readFileSync("letters/" + val.replace("/", ""), { encoding: "utf8" })
            const numPages = getNumberOfPagesFromHtml(html, val)
            // console.log(val + " " + numPages)
            for (let i = 2; i <= numPages; i++)
                acc.push(val + "/" + i)
            return acc
        }, []).sort()

        console.log("other pages to download:")
        console.log(otherPagesToDownload)

        downloadFromArray(otherPagesToDownload).then(() =>
        {
            console.log("EVERYTHING IS OVER")
        })
    })
    .catch((err) =>
    {
        console.error(err);
    })