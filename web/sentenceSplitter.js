const edict = require("./edict.js")

module.exports.split = (function split(sentence)
{

    if (sentence.length == 0)
        return []

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
