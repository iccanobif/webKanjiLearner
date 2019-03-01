const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

let sentences = {}
let isLoaded = false

ut.log("Start loading sentences")

readline
    .createInterface({ input: fs.createReadStream("../datasets/allSentences.csv") })
    .on("line", (line) =>
    {
        if (line.trim() == "")
            return;
        // Format:
        // {"char": "糞", "freq": 1, "jpn": "糞です", "kana": "くそです", "eng": "It's poop"}
        parsed = JSON.parse(line)
        if (parsed["char"] in sentences)
            sentences[parsed["char"]].push(parsed)
        else
            sentences[parsed["char"]] = [parsed]
    })
    .on("close", () =>
    {
        ut.log("Finished loading sentences")
        isLoaded = true
    })
    
module.exports.getFullListOfRandomSentences = () =>
{
    // TODO: precompute sorted keys instead of sorting at every request
    return Object.keys(sentences)
        .map((c) =>
        {
            let index = Math.floor((sentences[c].length) * Math.random())
            return sentences[c][index]
        })
        .sort((a, b) =>
        {
            if (a.freq > b.freq) return -1;
            if (a.freq < b.freq) return 1;
            return 0;
        })
}
module.exports.getRandomSentence = (char) =>
{
    if (!(char in sentences))
        return null

    let index = Math.floor((sentences[char].length) * Math.random())
    return sentences[char][index]
}
module.exports.getAllSentences = (char) =>
{
    if (!(char in sentences))
        return []
    else
        return sentences[char]
}
module.exports.isLoaded = () =>
{
    return isLoaded
}
