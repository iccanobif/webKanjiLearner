const fs = require("fs")
const readline = require("readline")
const { conjugate } = require("./conjugate.js")
const ut = require("./utils.js")

let dictionary = {}
let conjugatedToUnconjugatedFormsDictionary = {} // keys are strings, values are Set
let kanjiToReadingsDictionary = {}
let isLoaded = false
let callbacks = []

function makeCleanParsingStatus() 
{
    return {
        kanjiElements: [],
        readingElements: [],
        kanjiReadingLinks: [], // each "link" is an array [kanji, reading]
        keys: new Set(),
        partOfSpeech: new Set(),
        glosses: [],
        re_restr: []
    }
}

let currentParsingStatus = makeCleanParsingStatus()

ut.log("Start loading edict")

readline
    .createInterface({ input: fs.createReadStream("../datasets/JMdict_e") })
    .on("line", (line) =>
    {
        if (line.startsWith("<keb>"))
        {
            let keb = line.substring("<keb>".length, line.length - "</keb>".length)
            currentParsingStatus.kanjiElements.push(keb)
            currentParsingStatus.keys.add(keb)
        }
        if (line.startsWith("<reb>"))
        {
            let reb = line.substring("<reb>".length, line.length - "</reb>".length)
            currentParsingStatus.readingElements.push(reb)
            currentParsingStatus.keys.add(reb)
        }
        if (line.startsWith("<re_restr>"))
        {
            // This element is used to indicate when the reading only applies
            // to a subset of the keb elements in the entry. In its absence, all
            // readings apply to all kanji elements. The contents of this element 
            // must exactly match those of one of the keb elements.
            currentParsingStatus.re_restr.push(line.substring("<re_restr>".length, line.length - "</re_restr>".length))
        }
        if (line.startsWith("</r_ele>"))
        {
            // I assume that all kanjiElements for this entry have been loaded (all <k_ele> tags come before the <r_ele> ones)

            (currentParsingStatus.re_restr.length == 0
                ? currentParsingStatus.kanjiElements
                : currentParsingStatus.re_restr)
                .forEach((kanjiElement) =>
                {
                    currentParsingStatus.kanjiReadingLinks.push({
                        kanjiElement: kanjiElement,
                        readingElement: currentParsingStatus.readingElements[currentParsingStatus.readingElements.length - 1]
                    })
                })

            currentParsingStatus.re_restr = []
        }
        if (line.startsWith("<pos>"))
        {
            // For some reason <pos> entries begin with a & and end with a ;
            // I don't include them in the strings I add to the partOfSpeech array
            let type = line.substring("<pos>".length + 1, line.length - "</pos>".length - 1)
            currentParsingStatus.partOfSpeech.add(type)
        }
        if (line.startsWith("<gloss>"))
        {
            currentParsingStatus.glosses.push(line.substring("<gloss>".length, line.length - "</gloss>".length))
        }
        if (line.startsWith("</entry>"))
        {
            // I have collected all relevant data for this entry, can add it to the dictionary

            // Add unconjugated forms to the kanjiToReadingsDictionary
            currentParsingStatus
                .kanjiReadingLinks
                .forEach(link =>
                {
                    ut.addToDictionaryOfSets(kanjiToReadingsDictionary,
                        link.kanjiElement,
                        ut.katakanaToHiragana(link.readingElement))
                })

            // Conjugate all words I can conjugate, and at the same time populate the data
            // structures needed for converting kanji to kana etc..
            // Alas, some verbs (very few) can behave both as v1 and as v5r, so I have to loop through the the possible PoS's...
            Array
                .from(currentParsingStatus.partOfSpeech) // convert to array
                .forEach(partOfSpeech =>
                {
                    currentParsingStatus
                        .kanjiReadingLinks
                        .forEach(link =>
                        {
                            let conjugations = conjugate(link.kanjiElement, link.readingElement, partOfSpeech)
                            conjugations.forEach(conjugatedLink =>
                            {
                                ut.addToDictionaryOfSets(kanjiToReadingsDictionary,
                                    conjugatedLink.kanjiElement,
                                    ut.katakanaToHiragana(conjugatedLink.readingElement))
                                ut.addToDictionaryOfSets(conjugatedToUnconjugatedFormsDictionary,
                                    conjugatedLink.kanjiElement,
                                    link.kanjiElement)
                                ut.addToDictionaryOfSets(conjugatedToUnconjugatedFormsDictionary,
                                    conjugatedLink.readingElement,
                                    link.readingElement)
                                currentParsingStatus.kanjiReadingLinks.push(conjugatedLink)
                                currentParsingStatus.keys.add(conjugatedLink.kanjiElement)
                                currentParsingStatus.keys.add(conjugatedLink.readingElement)
                            })
                        })
                });

            // Now that I have enriched the kanjiReadingLinks with all the conjugated forms, it's time to add
            // this entry to the dictionary

            let entryData = {
                kanjiElements: currentParsingStatus.kanjiElements,
                readingElements: currentParsingStatus.readingElements,
                partOfSpeech: currentParsingStatus.partOfSpeech,
                glosses: currentParsingStatus.glosses
            }

            Array.from(currentParsingStatus.keys)
                .forEach((key) => // For each "key" adds the entry in the dictionary
                {
                    ut.addToDictionaryOfLists(dictionary, key, entryData)
                })

            currentParsingStatus = makeCleanParsingStatus()
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

let exceptions = {
    "私": ["わたし"],
    "彼": ["かれ"],
    "彼の": ["かれの"],
    "物": ["もの"],
    "母": ["はは"],
    "僕": ["ぼく"],
    "０": ["０"],
    "１": ["１"],
    "２": ["２"],
    "３": ["３"],
    "４": ["４"],
    "５": ["５"],
    "６": ["６"],
    "７": ["７"],
    "８": ["８"],
    "９": ["９"],
    "・": ["・"]
}

module.exports.getReadings = (word, doFiltering) =>
{
    if (doFiltering)
    {
        // For a few very common words that happen to also have a lot of uncommon readings (私 probably being 
        // the worst offender) or that have many common readings but that are unlikely to be the right ones
        // when looking for that word by itself (物 for example wouldn't normally be ぶつ, when alone) ignore
        // the dictionary and just return some hardcoded readings.    
        if (word in exceptions) return exceptions[word]
    }

    if (word in kanjiToReadingsDictionary)
        return Array.from(kanjiToReadingsDictionary[word])
    else
        return [word]
}

module.exports.getBaseForms = (conjugatedWord) =>
{
    if (conjugatedWord in conjugatedToUnconjugatedFormsDictionary)
        return Array.from(conjugatedToUnconjugatedFormsDictionary[conjugatedWord])
    else
        return [conjugatedWord] // It's not really conjugated, after all
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isLoaded)
        callback()
    else
        callbacks.push(callback)
}
