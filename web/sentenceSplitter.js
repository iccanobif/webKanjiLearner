const ut = require("./utils.js")
const edict = require("./edict.js")

module.exports.split = (function split(sentence)
{
    if (sentence.length == 0)
        return []
    for (i = sentence.length; i > 0; i--)
    {
        let firstWord = sentence.substring(0, i)
        if (edict.isJapaneseWord(firstWord))
            return [firstWord].concat(split(sentence.substring(i)))
    }
    return [sentence.charAt(0)].concat(split(sentence.substring(1)))
})
