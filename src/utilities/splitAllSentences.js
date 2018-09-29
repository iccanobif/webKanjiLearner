// This script isn't actually used in the app, it's here just for testing the splitter on all the availab esentences

const sentenceSplitter = require("../common/sentenceSplitter.js")
const edict = require("../common/edict.js")
const readline = require("readline")
const fs = require("fs")
const kuromoji = require("kuromoji")
console.log("Initializing")

edict.addLoadedCallback(() =>
{
    kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) =>
    {
        readline
            .createInterface({ input: fs.createReadStream("../output/allSentences.csv") })
            .on("line", (line) =>
            {
                if (line.trim() == "")
                    return;

                let sentence = JSON.parse(line)["jpn"]

                let edictSplits = sentenceSplitter.split(sentence).join(" ")
                let kuromojiSplits = tokenizer.tokenize(sentence).map(x => x.surface_form).join(" ")

                if (edictSplits != kuromojiSplits)
                {
                    console.log(sentence)
                    console.log("    edict: " + edictSplits)
                    console.log("kuroshiro: " + kuromojiSplits)

                }
            })
    })
})