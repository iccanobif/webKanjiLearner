const PORT = 8081

const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser");
const kanjidic = require("./kanjidic.js")
const ut = require("./utils.js")
const sentenceRepository = require("./sentenceRepository.js")
const sentenceSplitter = require("./sentenceSplitter.js")
const edict = require("./edict.js")
const jigen = require("./jigen.js")
const cedict = require("./cedict.js")
const { HiddenCharacterRepository } = require("./hiddenCharacterRepository.js")

app.use(bodyParser.urlencoded({ extended: false }));

const hiddenCharacterRepository = new HiddenCharacterRepository()

// Check "authentication" and whether the datasets are all loaded. If necessary, redirects to the login page or
// renders an error page and returns false.
function canOpenPage(req, res)
{
    if (req.query.userName == "" || req.query.userName == undefined || req.query.userName == null)
    {
        res.redirect("/?invalidLogin=true")
        return false
    }
    if (!sentenceRepository.isLoaded()
        || !edict.isLoaded()
        || !kanjidic.isLoaded()
        || !jigen.isLoaded()
        || !cedict.isLoaded()) 
    {
        res.render("stillLoading.ejs")
        return false
    }
    return true
}

//PAGES
app.get("/sentences", (req, res) =>
{
    if (!canOpenPage(req, res))
        return

    hiddenCharacterRepository.getHiddenCharacters(req.query.userName, (hiddenCharacters) =>
    {
        res.render("mainPage.ejs", {
            firstBatchOfRandomSentences:
                sentenceRepository.getFullListOfRandomSentences()
                    .filter((x) =>
                    {
                        return !hiddenCharacters.has(x["char"])
                    })
                    .slice(0, 25)
                    .shuffle() // TODO make some real pagination
                    .map((x) =>
                    {
                        x.splits = sentenceSplitter.split(x.jpn)
                        x.kana = x.splits
                            .map(x =>
                            {
                                let readings = edict.getReadings(x, true)
                                if (readings.length == 1)
                                    return readings[0]
                                else
                                    return "[" + readings.join("/") + "]"
                            })
                            .join("")
                        return x
                    }),
            userName: req.query.userName,
            sentenceSplitter: sentenceSplitter,
            edict: edict
        })
    })
})
app.get("/hiddenCharacters", (req, res) =>
{
    if (!canOpenPage(req, res))
        return

    hiddenCharacterRepository.getHiddenCharacters(req.query.userName, (hiddenCharacters) =>
    {
        res.render("hiddenCharacters.ejs", {
            hiddenCharacters: hiddenCharacters,
            userName: req.query.userName
        })
    })
})

//REST API
app.get("/:username/random-sentence/:character", (req, res) =>
{
    ut.log("Requested new sentence for character " + req.params.character)
    const randomSentence = sentenceRepository.getRandomSentence(req.params.character)
    if (randomSentence == null)
    {
        res.type("text/plain")
        res.status(404).end("Character not found.")
    }
    else
    {
        res.type("application/json")
        res.end(JSON.stringify({
            kanji: req.params.character,
            kanjiText: randomSentence.jpn,
            englishText: randomSentence.eng,
            kanaText: null
        }))
        ut.log("Sent new sentence for character " + req.params.character)
    }
})
app.get("/kanji/:character", (req, res) =>
{
    if (!sentenceRepository.isLoaded() || !kanjidic.isLoaded() || !edict.isLoaded())
    {
        res.render("stillLoading.ejs")
    }
    else
    {
        ut.log("Requested full sentence list for character " + req.params.character)
        let sentences = sentenceRepository.getAllSentences(req.params.character)
            .sort((a, b) =>
            {
                return a.jpn.localeCompare(b.jpn)
            })
            .shuffle()
            .map((x) =>
            {
                x.splits = sentenceSplitter.split(x.jpn)
                x.kana = x.splits
                    .map(x =>
                    {
                        let readings = edict.getReadings(x, true)
                        if (readings.length == 1)
                            return readings[0]
                        else
                            return "[" + readings.join("/") + "]"
                    })
                    .join("")
                return x
            })

        res.render("kanjiDetail.ejs", {
            character: req.params.character,
            sentences: sentences,
            readings: kanjidic.getKanjiReadings(req.params.character),
            meanings: kanjidic.getKanjiMeanings(req.params.character),
            jigen: jigen.getJigen(req.params.character),
            exampleWords: sentences
                .map(x => x.splits) // Extract the kanji text (split in words) from each sentence object
                .reduce((acc, val) => acc.concat(val), []) // Flatten into an array of arrays
                .filter(x => x.match(new RegExp(req.params.character))) // Only keep the strings containing the relevant character
                // Do a "GROUP BY" (sort, and then aggregate every adjacent element equal to each other, keeping count)
                .sort((a, b) => { return a.localeCompare(b) })
                .reduce((acc, val) =>
                {
                    if (acc.length == 0 || val != acc[acc.length - 1].word)
                        acc.push({ word: val, count: 1, readings: edict.getReadings(val, false) })
                    else
                        acc[acc.length - 1].count += 1
                    return acc
                }, [])
                .sort((a, b) => { return b.count - a.count }),
            sentenceSplitter: sentenceSplitter,
            edict: edict
        })
    }
})
app.get("/dictionary/:word", (req, res) =>
{
    let word = req.params.word
    ut.log("Requested dictionary Definition for character " + word)

    res.type("application/json")
    res.end(JSON.stringify({
        japaneseDefinitions: edict.getDefinitions(word),
        chineseDefinitions: cedict.getDefinitions(word)
    }))
})
app.get("/:username/hidden-characters", (req, res) => 
{
    hiddenCharacterRepository.getHiddenCharacters(req.params.username, (hiddenCharacters) =>
    {
        console.log(hiddenCharacters)
        res.type("application/json")
        res.end(JSON.stringify(hiddenCharacters))
    })
})
app.post("/:username/hidden-characters/:character", (req, res) =>
{
    const username = req.params.username
    const character = req.params.character

    hiddenCharacterRepository.hideCharacter(username, character)

    res.type("text/plain")
    res.end("OK, hidden " + character + " for user " + username)
})
app.delete("/:username/hidden-characters/:character", (req, res) =>
{
    const username = req.params.username
    const character = req.params.character

    hiddenCharacterRepository.unhideCharacter(username, character)

    res.type("text/plain")
    res.end("OK, unhidden " + character + " for user " + username)
})

app.use(express.static('web/static'))
http.listen(PORT, "0.0.0.0")
ut.log("Server running on port " + PORT)


// endpoints:

// GET /:username/random-sentence
// GET /:username/random-sentence/:character
// GET /kanji/:character
// GET /dictionary/:word
// GET /:username/hidden-characters -> returns list of all hidden characters
// POST /:username/hidden-characters/:character -> hides a character
// DELETE /:username/hidden-characters/:character -> unhides a character
