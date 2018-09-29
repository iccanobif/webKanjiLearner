const readline = require('readline')
const fs = require("fs")
const ut = require("./utils.js")

class KanjiInfo
{
    constructor(kanji, readings, meanings)
    {
        this.kanji = kanji
        this.readings = readings
        this.meanings = meanings
    }
}

let kanjiInfoCollection = {}
let isLoaded = false
let callbacks = []

ut.log("Start loading kanjidic")

readline
    .createInterface({ input: fs.createReadStream("../datasets/kanjidic") }) // This file has to be encoded in UTF-8 and not in shift-jis
    .on("line", (line) =>
    {
        line = line.trim()

        // Format:
        // 唖 3022 U5516 B30 S10 XJ13560 XJ14D64 N939 V795 L2958 DN2964 MN3743 MP2.1066 P1-3-7 I3d8.3 Q6101.7 Yya1 Wa ア アク おし {mute} {dumb} 
        let splits = line.split(" ")

        let kanji = splits[0]
        let readings = splits
            .slice(2) // Ignore the first two items (it's the kanji and the JIS number)
            .filter((x) =>
            {
                return !(x.match(/[A-Za-z]/))
            })
        let meanings = line
            .slice(line.indexOf("{") + 1, -1) // Get the full text of the meanings except for the first { and the last }
            .split("} {") // Remove the remaining curly braces and split

        kanjiInfoCollection[kanji] = new KanjiInfo(kanji, readings, meanings)
    })
    .on("close", () =>
    {
        ut.log("Finished loading kanjidic")
        isLoaded = true
        callbacks.forEach(callback => callback())
        callbacks = null
    })

module.exports.isLoaded = () =>
{
    return isLoaded
}

module.exports.getKanjiReadings = (kanji) =>
{
    ut.log("Getting kanji readings for " + kanji)
    return kanjiInfoCollection[kanji].readings
}

module.exports.getKanjiMeanings = (kanji) => 
{
    ut.log("Getting kanji meanings for " + kanji)
    return kanjiInfoCollection[kanji].meanings
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isLoaded)
        callback()
    else
        callbacks.push(callback)
}
