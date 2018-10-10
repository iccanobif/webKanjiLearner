const express = require("express")
const app = express()
const http = require("http").Server(app)
const sqlite3 = require("sqlite3")
const bodyParser = require("body-parser");
const kanjidic = require("../common/kanjidic.js")
const ut = require("../common/utils.js")
const sentenceRepository = require("../common/sentenceRepository.js")
const sentenceSplitter = require("../common/sentenceSplitter.js")
const edict = require("../common/edict.js")

function readCookie(cookies, cookieName)
{
    c = cookies.split(";");
    for (var i = 0; i < c.length; i++)
    {
        s = c[i].trim().split("=")
        if (s[0] == cookieName)
            return s[1];
    }
    return null;
}

app.use(bodyParser.urlencoded({ extended: false }));

let HiddenCharacterRepository = function ()
{
    let db = new sqlite3.Database('web/db.db');
    db.serialize(() =>
    {
        db.run("CREATE TABLE IF NOT EXISTS HIDDEN_CHARACTERS (USER_ID, CHARACTER)")
    })
    this.hideCharacter = (user, character) =>
    {
        if (user == "" || user == undefined || user == null)
        {
            ut.log("Tried to hide character " + character + " for empty or null user. Won't do anything.")
            return
        }
        ut.log("Hiding character " + character + " for user " + user)
        db.run("INSERT INTO HIDDEN_CHARACTERS (USER_ID, CHARACTER) VALUES (?, ?)",
            [user, character],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.unhideCharacter = (user, character) =>
    {
        if (user == "" || user == undefined || user == null)
        {
            ut.log("Tried to unhide character " + character + " for empty or null user. Won't do anything.")
            return
        }
        ut.log("Unhiding character " + character + " for user " + user)
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ? AND CHARACTER = ?",
            [user, character],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.unhideAllCharacters = (user) =>
    {
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.getHiddenCharacters = (user, callback) =>
    {
        db.all("SELECT CHARACTER FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err, rows) =>
            {
                if (err)
                {
                    ut.printError(err)
                    callback(new Set())
                }
                else 
                {
                    callback(new Set(rows.map((row) => row["CHARACTER"])))
                }
            })
    }
}

let hiddenCharacterRepository = new HiddenCharacterRepository()

// Check "authentication" and whether the datasets are all loaded. If necessary, redirects to the login page or
// renders an error page and returns false.
function canOpenPage(req, res)
{
    if (req.query.userName == "" || req.query.userName == undefined || req.query.userName == null)
    {
        res.redirect("/?invalidLogin=true")
        return false
    }
    if (!sentenceRepository.isLoaded() || !edict.isLoaded() || !kanjidic.isLoaded()) 
    {
        res.render("stillLoading.ejs")
        return false
    }
    return true
}

app.set("view engine", "ejs")
app.set("views", "web/views")
//PAGES
app.get("/", (req, res) =>
{
    res.render("login.ejs", { invalidLogin: req.query.invalidLogin == "true" ? true : false })
})
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
                    .slice(0, 50)
                    .shuffle() // TODO make some real pagination
                    .map((x) =>
                    {
                        x.splits = sentenceSplitter.split(x.jpn)
                        x.kana = x.splits
                            .map(x =>
                            {
                                let readings = edict.getReadings(x)
                                if (readings.length == 1)
                                    return readings[0]
                                else
                                    return "[" + readings.join("/") + "]"
                            })
                            .join("")
                        return x
                    }),
            userName: req.query.userName
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
app.get("/getRandomSentence/:character", (req, res) =>
{
    ut.log("Requested new sentence for character " + req.params.character)
    let randomSentence = sentenceRepository.getRandomSentence(req.params.character)
    if (randomSentence == null)
    {
        res.type("text/plain")
        res.status(404).end("Character not found.")
    }
    else
    {
        res.type("application/json")
        randomSentence.splits = sentenceSplitter.split(randomSentence.jpn)
        randomSentence.kana = randomSentence.splits
        .map(x =>
        {
            let readings = edict.getReadings(x)
            if (readings.length == 1)
                return readings[0]
            else
                return "[" + readings.join("/") + "]"
        })
        .join("")
        res.end(JSON.stringify(randomSentence))
        ut.log("Sent new sentence for character " + req.params.character)
    }
})
app.get("/kanjiDetail/:character", (req, res) =>
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
                    let readings = edict.getReadings(x)
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
            exampleWords: sentences
                .map(x => x.splits) // Extract the kanji text (split in words) from each sentence object
                .reduce((acc, val) => acc.concat(val), []) // Flatten into an array of arrays
                .filter(x => x.match(new RegExp(req.params.character))) // Only keep the strings containing the relevant character
                // Do a "GROUP BY" (sort, and then aggregate every adjacent element equal to each other, keeping count)
                .sort((a, b) => { return a.localeCompare(b) })
                .reduce((acc, val) =>
                {
                    if (acc.length == 0 || val != acc[acc.length - 1].word)
                        acc.push({ word: val, count: 1 })
                    else
                        acc[acc.length - 1].count += 1
                    return acc
                }, [])
                .sort((a, b) => { return b.count - a.count })
        })
    }
})
app.get("/dictionaryDefinition/:word", (req, res) =>
{
    if (!sentenceRepository.isLoaded() || !kanjidic.isLoaded() || !edict.isLoaded())
    {
        res.render("stillLoading.ejs")
    }
    else
    {
        let word = req.params.word
        ut.log("Requested dictionary Definition for character " + word)

        res.render("dictionaryDefinition.ejs", {
            word: word,
            definitions: edict.getDefinitions(word)
        })
    }
})
app.post("/hideCharacter", (req, res) =>
{
    hiddenCharacterRepository.hideCharacter(req.body.userId, req.body.character)
    res.type("text/plain")
    res.end("OK")
})
app.post("/unhideCharacter", (req, res) =>
{
    hiddenCharacterRepository.unhideCharacter(req.body.userId, req.body.character)
    res.type("text/plain")
    res.end("OK")
})

app.use(express.static('web/static'))
http.listen(8081, "0.0.0.0")
ut.log("Server running")
