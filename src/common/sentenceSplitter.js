const edict = require("./edict.js")
const ut = require("./utils.js")

let particles = new Set(["は", "が", "を", "に", "で"])

module.exports.split = (function split(sentence)
{
    if (sentence.length == 0)
        return []
    if (sentence.length == 1)
        return [sentence]
        
    // Splitting running both splitPrioritizeLeft() and splitPrioritizeRight() as following is just too slow...
    // I'll bypass that for now and keep using only splitPrioritizeLeft()
    return splitPrioritizeLeft(sentence)

    let leftPrioritizedSplits = splitPrioritizeLeft(sentence)
    let rightPrioritizedSplits = splitPrioritizeRight(sentence)

    if (getMaxLenght(leftPrioritizedSplits) >= getMaxLenght(rightPrioritizedSplits))
        return leftPrioritizedSplits
    else
        return rightPrioritizedSplits
})

function splitPrioritizeLeft(sentence)
{
    for (i = sentence.length; i > 0; i--)
    {
        let firstWord = sentence.substring(0, i)

        if (edict.isJapaneseWord(firstWord))
            return [firstWord].concat(module.exports.split(sentence.substring(i)))

        // if "firstWord" is not a word, also check whether it's a particle + a word
        if (particles.has(sentence.charAt(0))
            && edict.isJapaneseWord(firstWord.substring(1)))
            return [firstWord.charAt(0), firstWord.substring(1)]
                .concat(module.exports.split(sentence.substring(i)))
    }
    return [sentence.charAt(0)].concat(module.exports.split(sentence.substring(1)))
}

function splitPrioritizeRight(sentence)
{
    for (i = 0; i < sentence.length - 1; i++)
    {
        let firstWord = sentence.substring(i, sentence.length)
        if (edict.isJapaneseWord(firstWord))
            return module.exports.split(sentence.substring(0, i)).concat([firstWord])
    }

    return module.exports.split(sentence.substring(0, sentence.length - 1)).concat([sentence.charAt(sentence.length - 1)])
}

function getMaxLenght(arrayOfStrings)
{
    return arrayOfStrings.reduce((acc, val) =>
    {
        return val.length > acc ? val.length : acc
    }, 0)
}

// edict.addLoadedCallback(() =>
// {
//     let stringona = "※基本的な禁止事項（誹謗・中傷の禁止等）は「はじめにお読み下さい」に記載してあります。必ずお読みください。"
//     ut.log("Start splitting")

//     for (let i = 1; i <= stringona.length; i++)
//     {
//         ut.log(module.exports.split(stringona.substring(0, i)))
//     }

//     ut.log("Done splitting")
// })
