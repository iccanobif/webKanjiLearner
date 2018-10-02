const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

const partOfSpeechWhitelist = new Set("v1|v5aru|v5b|v5g|v5k-s|v5k|v5m|v5n|v5r-i|v5r|v5s|v5t|v5u-s|v5uru|v5u|v5|adj-ix|adj-i".split("|"))
const unsupportedConjugations = new Set(["v5", "v5aru", "v5r-i", "v5u-s", "v5uru"])

let dictionary = {}
let conjugatedToUnconjugatedFormsDictionary = {}
let isLoaded = false
let callbacks = []

function makeNewDictionaryEntry()
{
    return {
        kanjiElements: [],
        readingElements: [],
        partOfSpeech: new Set(),
        glosses: [] // Meanings
    }
}

let currentEntryData = makeNewDictionaryEntry()

function conjugate(word, partOfSpeech)
{
    if (partOfSpeech == null)
        return []
    if (unsupportedConjugations.has(partOfSpeech))
        return [] // I don't know how to conjugate this stuff (yet)

    let newWords = []

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
            add("さ") // nominalization
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
        add(firstNegativeKana)  // 未然形

        add(stemKana) // stem
        add(stemKana + "たい") // tai-form
        add(stemKana + "ます") // masu-form
        add(stemKana + "ました") // masu-form (past)
        add(stemKana + "ません") // masu-form (negative)
    }

    return newWords
}

ut.log("Start loading edict")

readline
    .createInterface({ input: fs.createReadStream("../datasets/JMdict_e") })
    .on("line", (line) =>
    {
        if (line.startsWith("<keb>"))
        {
            currentEntryData.kanjiElements.push(line.substring("<keb>".length, line.length - "</keb>".length))
        }
        if (line.startsWith("<reb>"))
        {
            currentEntryData.readingElements.push(line.substring("<reb>".length, line.length - "</reb>".length))
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
            Array
                .from(currentEntryData.partOfSpeech) // convert to array
                .filter((partOfSpeech) => partOfSpeechWhitelist.has(partOfSpeech)) // only consider the relevant types of part of speech for conjugations
                .reduce((acc, partOfSpeech) =>
                {
                    // Get the conjugations for this verb considering every type of part of speech and aggregate them
                    let newConjugations = currentEntryData.kanjiElements
                        .concat(currentEntryData.readingElements)
                        .map((word) => 
                        {
                            let conjugations = conjugate(word, partOfSpeech)
                            conjugations.forEach((x) =>
                            {
                                if (x in conjugatedToUnconjugatedFormsDictionary)
                                    conjugatedToUnconjugatedFormsDictionary[x].add(word)
                                else
                                    conjugatedToUnconjugatedFormsDictionary[x] = new Set([word])
                            })
                            return conjugations
                        })
                        .reduce((acc, val) => acc.concat(val), []) // Flatten

                    return acc.concat(newConjugations)
                }, currentEntryData.kanjiElements.concat(currentEntryData.readingElements))
                .uniq() // remove duplicates
                .forEach((x) => // For each "key" adds the entry in the dictionary
                {
                    if (x in dictionary)
                        dictionary[x].push(currentEntryData)
                    else
                        dictionary[x] = [currentEntryData]
                })

            currentEntryData = makeNewDictionaryEntry()
        }
    })
    .on("close", () =>
    {
        ut.log("Finished loading edict")
        isLoaded = true
        callbacks.forEach(callback => callback())
        callbacks = null
    })

module.exports.isLoaded = () =>
{
    return isLoaded
}

module.exports.isJapaneseWord = (word) =>
{
    return word in dictionary
}

module.exports.getDefinitions = (word) =>
{
    if (word in dictionary)
        return dictionary[word]
    else
        return []
}

module.exports.getReadings = (word) =>
{
    throw new Error("Not implemented")
}

module.exports.getBaseForm = (conjugatedWord) =>
{
    if (conjugatedWord in conjugatedToUnconjugatedFormsDictionary)
        return Array.from(conjugatedToUnconjugatedFormsDictionary[conjugatedWord])
    else
        return conjugatedWord // It's not really conjugated, after all
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isLoaded)
        callback()
    else
        callbacks.push(callback)
}
