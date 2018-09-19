const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

const typeOfWordWhitelist = new Set("v1|v5aru|v5b|v5g|v5k-s|v5k|v5m|v5n|v5r-i|v5r|v5s|v5t|v5u-s|v5uru|v5u|v5|adj-ix|adj-i".split("|"))
const unsupportedConjugations = new Set(["v5", "v5aru", "v5r-i", "v5u-s", "v5uru"])

let wordsSet = new Set()
let isFullyLoaded = false
let callbacks = []

let currentEntryData = { keys: [], typeOfWord: null }

function conjugate(words, typeOfWord)
{
    if (typeOfWord == null)
        return words
    if (unsupportedConjugations.has(typeOfWord))
        return words // I don't know how to conjugate this stuff (yet)

    let newWords = []
    words.forEach((word) =>
    {
        let root = word.slice(0, word.length - 1)
        let add = (w) => { newWords.push(root + w) }

        switch (typeOfWord)
        {
            case "adj-i":
                add("くない") // negative
                add("く")    // adverbial form
                add("かった") // past
                add("くなかった") // past negative
                add("くて") // te-form
                break;
            case "adj-ix":
                newWords.push(word.slice(0, word.length - 2) + "よくない") // negative
                newWords.push(word.slice(0, word.length - 2) + "よく") // adverbial form
                newWords.push(word.slice(0, word.length - 2) + "よかった") // past
                newWords.push(word.slice(0, word.length - 2) + "よくなかった") // past negative
                newWords.push(word.slice(0, word.length - 2) + "よくて") // te-form
                break;
            case "v1":
                add("") // stem
                add("ます") // masu-form
                add("ない") // negative
                add("た") // past
                add("なかった") // past negative
                add("て") // -te form
                add("られる") // potential + passive (they're the same for ichidan verbs...)
                add("させる") // causative
                add("よう") // volitive
                add("たい") // tai-form
                add("ず") // zu-form
                break;
            case "v5s":
                add("した") // past
                add("して") // -te form
                break;
            case "v5k":
                add("いた") // past
                add("いて") // -te form
                break;
            case "v5g":
                add("いだ") // past
                add("いで") // -te form
                break;
            case "v5k-s": // for verbs ending in 行く
                add("った") // past
                add("いて") // -te form
                break;
            case "v5b":
            case "v5m":
            case "v5n":
                add("んだ") // past
                add("んで") // -te form
                break;
            case "v5r":
            case "v5t":
            case "v5u":
                add("った") // past
                add("って") // -te form
        }

        let firstNegativeKana = ""
        let stemKana = ""

        switch (typeOfWord)
        {
            case "v5k-s": // potential // volitive   
            case "v5k": add("ける"); add("こう"); stemKana = "き"; firstNegativeKana = "か"; break;
            case "v5g": add("げる"); add("ごう"); stemKana = "ぎ"; firstNegativeKana = "が"; break;
            case "v5b": add("べる"); add("ぼう"); stemKana = "び"; firstNegativeKana = "ば"; break;
            case "v5m": add("める"); add("もう"); stemKana = "み"; firstNegativeKana = "ま"; break;
            case "v5n": add("ねる"); add("のう"); stemKana = "に"; firstNegativeKana = "な"; break;
            case "v5r": add("れる"); add("ろう"); stemKana = "り"; firstNegativeKana = "ら"; break;
            case "v5t": add("てる"); add("とう"); stemKana = "ち"; firstNegativeKana = "た"; break;
            case "v5u": add("える"); add("おう"); stemKana = "い"; firstNegativeKana = "わ"; break;
            case "v5s": add("せる"); add("そう"); stemKana = "し"; firstNegativeKana = "さ"; break;
        }

        if (typeOfWord.startsWith("v5"))
        {
            add(firstNegativeKana + "ない")  // negative
            add(firstNegativeKana + "なかった")  // past negative
            add(firstNegativeKana + "せる")  // causative
            add(firstNegativeKana + "れる")  // passive
            add(firstNegativeKana + "ず")  // zu-form
            add(stemKana) // stem
            add(stemKana + "たい") // tai-form
            add(stemKana + "ます") // masu-form
        }
    })

    return words.concat(newWords)
}

ut.log("Start loading edict")
readline
    .createInterface({ input: fs.createReadStream("JMdict_e") })
    .on("line", (line) =>
    {
        if (line.startsWith("<keb>") || line.startsWith("<reb>"))
            currentEntryData.keys.push(line.substring(5, line.length - 6))
        if (line.startsWith("<pos>"))
        {
            // For some reason <pos> entries begin with a & and end with a ;
            // I don't include them in the strings i add to typesOfWord
            let type = line.substring(6, line.length - 7)

            if (typeOfWordWhitelist.has(type))
                currentEntryData.typeOfWord = type
        }
        if (line.startsWith("</entry>"))
        {
            // Collected all relevant data for this entry, can add it to the dictionary

            currentEntryData.keys = conjugate(currentEntryData.keys, currentEntryData.typeOfWord)

            currentEntryData.keys.forEach((x) => { wordsSet.add(x) })
            currentEntryData = { keys: [], typesOfWord: [] } // Reset the currentEntryData
        }
    })
    .on("close", () =>
    {
        ut.log("Finished loading edict")
        isFullyLoaded = true
        callbacks.forEach(callback => callback())
        callbacks = null
    })

module.exports.isLoaded = () =>
{
    return isFullyLoaded
}

module.exports.isJapaneseWord = (word) =>
{
    return wordsSet.has(word)
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isFullyLoaded)
        callback()
    else
        callbacks.push(callback)
}
