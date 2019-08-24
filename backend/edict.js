const fs = require("fs")
const readline = require("readline")
const { conjugate } = require("./conjugate.js")
const ut = require("./utils.js")
const xml = require("xml2js")
const mongodb = require("mongodb")

let isLoaded = false
let callbacks = []

async function initializeDb()
{
    let currentEntryLines = []
    const conn = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    try
    {
        const db = conn.db("webKanjiLookup")
        const edictCollection = db.collection("edict")
        // edictCollection.createIndex({ urlId: 1 }, { unique: true })

        if (edictCollection.countDocuments() > 0)
        {
            ut.log("Edict database is already initialized")
            return
        }

        ut.log("Initializing Edict database")

        readline
            .createInterface({ input: fs.createReadStream("../datasets/JMdict_e") })
            .on("line", (line) =>
            {
                if (line.match(/^<keb>|^<reb>|^<re_restr>|^<\/r_ele>|^<pos>|^<gloss>/))
                    currentEntryLines.push(line)
                if (line.startsWith("<gloss>"))
                {
                    currentParsingStatus.glosses.push(line.substring("<gloss>".length, line.length - "</gloss>".length))
                }
                if (line.startsWith("</entry>"))
                {
                    xml.parseString(currentEntryLines.join(""), (err, result) => 
                    {
                        if (err) throw err

                        const glosses = currentEntryLines
                            .filter(l => l.startsWith("<gloss>"))
                            .map(l => l.substring("<gloss>".length, l.length - "</gloss>".length))

                        const kanjiElements = currentEntryLines
                            .filter(l => l.startsWith("<keb>"))
                            .map(l => l.substring("<keb>".length, l.length - "</keb>".length))

                        const readingElements = currentEntryLines
                            .filter(l => l.startsWith("<reb>"))
                            .map(l => l.substring("<reb>".length, l.length - "</reb>".length))

                        // For some reason <pos> entries begin with a & and end with a ;
                        // I don't include them in the strings I add to the partOfSpeech array
                        const partOfSpeechList = currentEntryLines
                            .filter(l => l.startsWith("<pos>"))
                            .map(l => l.substring("<pos>".length + 1, l.length - "</pos>".length - 1))

                        const readingLinks = result
                            .r_ele
                            .map(e => kanjiElements // Cartesian product between kanji elements and their readings
                                .map(kanjiElement =>
                                    (e.re_restr ? e.re_restr : readingElements)
                                        .map(reading =>
                                            ({
                                                kanji: kanjiElement,
                                                reading: reading
                                            })
                                        )
                                ))
                            .flat(2)
                            .map(link =>
                                ({
                                    kanji: link.kanji,
                                    reading: link.reading,
                                    conjugations: partOfSpeechList.map(pos =>
                                        conjugate(unconjugatedLink.kanji, unconjugatedLink.reading, pos)
                                    ).flat()
                                }))

                        const allKeys = readingLinks.reduce((acc, val) =>
                        {
                            acc.push([val.kanji, val.reading]
                                .concat(val.conjugations.map(c => c.kanji))
                                .concat(val.conjugations.map(c => c.reading)))
                        }, [])

                        await edictCollection.insertOne({
                            glosses: glosses,
                            pos: partOfSpeechList,
                            readingLinks: readingLinks,
                            allKeys: allKeys
                        })
                    })

                }
            })
            .on("close", () =>
            {
                ut.log("Finished loading edict")
                isLoaded = true
                callbacks.forEach(callback => callback())
                callbacks = null
            })
    }
    finally 
    {
        conn.close()
    }
}

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
