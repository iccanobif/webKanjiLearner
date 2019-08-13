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

console.log(cartesianProduct.join(";"))

merda = []

go(cartesianProduct, 30, async (element) =>
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            merda.push(element)
            resolve()
        }
        catch (err)
        {
            reject(err)
        }
    })
})