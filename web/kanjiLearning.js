const express = require('express')
const app = express()
const http = require('http').Server(app)
const fs = require('fs')
const readline = require('readline')

function log(msg)
{
    let d = new Date()
    console.log("[" + d.toISOString() + "] " + msg)
}

function printError(e)
{
    log(e.message + " " + e.stack)
}

let SentenceRepository = function ()
{
    this.sentences = {}
    this.isLoaded = false
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
                log("Finished loading datasets")
                this.isLoaded = true
            })
    }
    this.getFullListOfRandomSentences = () =>
    {
        // TODO: precompute sorted keys instead of sorting at every request
        return Object.keys(this.sentences)
            .map((c) =>
            {
                let index = Math.floor((this.sentences[c].length - 1) * Math.random())
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
        // if (!(char in this.sentences))
        //     return null;

        let index = Math.floor((this.sentences[char].length - 1) * Math.random())

        // log("index: " + index)
        // log("this.sentences[char]: " + this.sentences[char])
        // console.log("this.sentences[char][index]: ", this.sentences[char][index])
        
        return this.sentences[char][index]
    }

    this.loadSentences()
}

let sentenceRepository = new SentenceRepository()

app.set("view engine", "ejs")
app.get("/", (req, res) =>
{
    if (!sentenceRepository.isLoaded)
    {
        res.render("stillLoading.ejs")
    }
    else
    {
        res.render("index.ejs", {
            firstBatchOfRandomSentences: sentenceRepository.getFullListOfRandomSentences()
        })
    }
})

app.get("/getRandomSentence/:char", (req, res) =>
{
    res.type("application/json")
    res.end(JSON.stringify(sentenceRepository.getRandomSentence(req.params.char)))
})

app.use(express.static('static', {
    "maxAge": 24 * 60 * 60 * 1000 // 1 day in milliseconds
}))

http.listen(8081, "0.0.0.0")

log("Server running")