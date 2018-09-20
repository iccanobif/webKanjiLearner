const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

module.exports.SentenceRepository = function ()
{
    this.sentences = {}
    this.isLoaded = false

    ut.log("Start loading sentences")

    this.loadSentences = () =>
    {
        readline
            .createInterface({ input: fs.createReadStream("../output/allSentences.csv") })
            .on("line", (line) =>
            {
                if (line.trim() == "")
                    return;
                // Format:
                // {"char": "糞", "freq": 1, "jpn": "糞です", "kana": "くそです", "eng": "It's poop"}
                parsed = JSON.parse(line)
                if (parsed["char"] in this.sentences)
                    this.sentences[parsed["char"]].push(parsed)
                else
                    this.sentences[parsed["char"]] = [parsed]
            })
            .on("close", () =>
            {
                ut.log("Finished loading sentences")
                this.isLoaded = true
            })
    }
    this.getFullListOfRandomSentences = () =>
    {
        // TODO: precompute sorted keys instead of sorting at every request
        return Object.keys(this.sentences)
            .map((c) =>
            {
                let index = Math.floor((this.sentences[c].length) * Math.random())
                return this.sentences[c][index]
            })
            .sort((a, b) =>
            {
                if (a.freq > b.freq) return -1;
                if (a.freq < b.freq) return 1;
                return 0;
            })
    }
    this.getRandomSentence = (char) =>
    {
        if (!(char in this.sentences))
            return null

        let index = Math.floor((this.sentences[char].length) * Math.random())
        return this.sentences[char][index]
    }
    this.getAllSentences = (char) =>
    {
        if (!(char in this.sentences))
            return []
        else
            return this.sentences[char]
    }

    this.loadSentences()
}