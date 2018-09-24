const fs = require("fs")
const readline = require("readline")
const assert = require("assert")
const ut = require("./utils.js")

const partOfSpeechWhitelist = new Set("v1|v5aru|v5b|v5g|v5k-s|v5k|v5m|v5n|v5r-i|v5r|v5s|v5t|v5u-s|v5uru|v5u|v5|adj-ix|adj-i".split("|"))
const unsupportedConjugations = new Set(["v5", "v5aru", "v5r-i", "v5u-s", "v5uru"])

let entireDictionary = {}
let isFullyLoaded = false
let callbacks = []

function makeNewDictionaryEntry()
{
    return { keys: [], partOfSpeech: new Set(), glosses: [] }
}

let currentEntryData = makeNewDictionaryEntry()

function conjugate(words, partOfSpeech)
{
    if (partOfSpeech == null)
        return []
    if (unsupportedConjugations.has(partOfSpeech))
        return [] // I don't know how to conjugate this stuff (yet)

    let newWords = []
    words.forEach((word) =>
    {
        let root = word.slice(0, word.length - 1)
        let add = (w) => { newWords.push(root + w) }

        switch (partOfSpeech)
        {
            case "adj-i":
                add("くない") // negative
                add("く")    // adverbial form
                add("かった") // past
                add("くなかった") // past negative
                add("くて") // te-form
                add("すぎる") // too much
                add("すぎ") // too much
                add("そう") // looks like it's...
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
                add("ました") // masu-form
                add("ません") // masu-form
                add("ない") // negative
                add("た") // past
                add("なかった") // past negative
                add("て") // -te form
                add("ている") // -te+iru form
                add("てる") // -teiru form (informal)
                add("られる") // potential + passive (they're the same for ichidan verbs...)
                add("させる") // causative
                add("よう") // volitive
                add("たい") // tai-form
                add("ず") // zu-form
                add("ろ") // imperative
                add("ぬ") // archaic negative
                break;
            case "v5s":
                add("した") // past
                add("して") // -te form
                add("している") // -te+iru form
                add("してる") // -te+iru form (informal)
                break;
            case "v5k":
                add("いた") // past
                add("いて") // -te form
                add("いている") // -te+iru form
                add("いてる") // -te+iru form (informal)
                break;
            case "v5g":
                add("いだ") // past
                add("いで") // -te form
                add("いでいる") // -te+iru form
                add("いでる") // -te+iru form (informal)
                break;
            case "v5k-s": // for verbs ending in 行く
                add("った") // past
                add("いて") // -te form
                add("いている") // -te+iru form
                add("いてる") // -te+iru form (informal)
                break;
            case "v5b":
            case "v5m":
            case "v5n":
                add("んだ") // past
                add("んで") // -te form
                add("んている") // -te+iru form
                add("んてる") // -te+iru form (informal)
                break;
            case "v5r":
            case "v5t":
            case "v5u":
                add("った") // past
                add("って") // -te form
                add("っている") // -te+iru form
                add("ってる") // -te+iru form (informal)
        }

        let firstNegativeKana = ""
        let stemKana = ""

        switch (partOfSpeech)
        {
            case "v5k-s": // potential // volitive // imperative  
            case "v5k": add("ける"); add("こう"); add("け"); stemKana = "き"; firstNegativeKana = "か"; break;
            case "v5g": add("げる"); add("ごう"); add("げ"); stemKana = "ぎ"; firstNegativeKana = "が"; break;
            case "v5b": add("べる"); add("ぼう"); add("べ"); stemKana = "び"; firstNegativeKana = "ば"; break;
            case "v5m": add("める"); add("もう"); add("め"); stemKana = "み"; firstNegativeKana = "ま"; break;
            case "v5n": add("ねる"); add("のう"); add("ね"); stemKana = "に"; firstNegativeKana = "な"; break;
            case "v5r": add("れる"); add("ろう"); add("れ"); stemKana = "り"; firstNegativeKana = "ら"; break;
            case "v5t": add("てる"); add("とう"); add("て"); stemKana = "ち"; firstNegativeKana = "た"; break;
            case "v5u": add("える"); add("おう");　/* ???? */ stemKana = "い"; firstNegativeKana = "わ"; break;
            case "v5s": add("せる"); add("そう"); add("せ"); stemKana = "し"; firstNegativeKana = "さ"; break;
        }

        if (partOfSpeech.startsWith("v5"))
        {
            add(firstNegativeKana + "ない")  // negative
            add(firstNegativeKana + "なかった")  // past negative
            add(firstNegativeKana + "せる")  // causative
            add(firstNegativeKana + "れる")  // passive
            add(firstNegativeKana + "ず")  // zu-form
            add(firstNegativeKana + "ぬ")  // archaic negative
            add(stemKana) // stem
            add(stemKana + "たい") // tai-form
            add(stemKana + "ます") // masu-form
            add(stemKana + "ました") // masu-form (past)
            add(stemKana + "ません") // masu-form (negative)
        }
    })

    return newWords
}

ut.log("Start loading edict")

readline
    .createInterface({ input: fs.createReadStream("JMdict_e") })
    .on("line", (line) =>
    {
        if (line.startsWith("<keb>") || line.startsWith("<reb>"))
        {
            currentEntryData.keys.push(line.substring("<keb>".length, line.length - "</keb>".length))
        }
        if (line.startsWith("<pos>"))
        {
            // For some reason <pos> entries begin with a & and end with a ;
            // I don't include them in the strings I add to the partOfSpeech array
            let type = line.substring("<pos>".length + 1, line.length - "</pos>".length - 1)

            if (partOfSpeechWhitelist.has(type))
                currentEntryData.partOfSpeech.add(type)
        }
        if (line.startsWith("<gloss>"))
        {
            currentEntryData.glosses.push(line.substring("<gloss>".length, line.length - "</gloss>".length))
        }
        if (line.startsWith("</entry>"))
        {
            // I have collected all relevant data for this entry, can add it to the dictionary

            // Alas, some verbs (very few) can behave both as v1 and as v5r...
            currentEntryData.keys = Array
                .from(currentEntryData.partOfSpeech) // convert to array
                .filter((partOfSpeech) => partOfSpeechWhitelist.has(partOfSpeech)) // only consider the relevant types of part of speech for conjugations
                .reduce((acc, partOfSpeech) =>
                {
                    // Get the conjugations for this verb considering every type of part of speech and aggregate them
                    return acc.concat(conjugate(currentEntryData.keys, partOfSpeech))
                }, currentEntryData.keys)
                .uniq() // remove duplicates

            currentEntryData.keys.forEach((x) =>
            {
                if (x in entireDictionary)
                    entireDictionary[x].push(currentEntryData)
                else
                    entireDictionary[x] = [currentEntryData]
            })

            currentEntryData = makeNewDictionaryEntry()
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
    return word in entireDictionary
}

module.exports.getDefinitions = (word) =>
{
    if (word in entireDictionary)
        return entireDictionary[word]
    else
        return []
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isFullyLoaded)
        callback()
    else
        callbacks.push(callback)
}
