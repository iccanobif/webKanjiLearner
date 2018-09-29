// This script isn't actually used in the app, it's here just for testing the splitter on all the availab esentences

const sentenceSplitter = require("./sentenceSplitter.js")
const edict = require("./edict.js")
const readline = require("readline")
const fs = require("fs")

edict.addLoadedCallback(() =>
{
    readline
        .createInterface({ input: fs.createReadStream("../output/allSentences.csv") })
        .on("line", (line) =>
        {
            if (line.trim() == "")
                return;

            let sentence = JSON.parse(line)["jpn"]
            console.log(sentence)
            console.log("   " + sentenceSplitter.split(sentence).join(" "))
        })
})