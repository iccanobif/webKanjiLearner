const express = require("express")
const app = express()
const http = require("http").Server(app)
const sqlite3 = require("sqlite3")
const bodyParser = require("body-parser");
const kanjidic = require("./kanjidic.js")
const ut = require("./utils.js")
const sr = require("./sentenceRepository.js")
const sentenceSplitter = require("./sentenceSplitter.js")

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

let sentenceRepository = new sr.SentenceRepository()

let HiddenCharacterRepository = function ()
{
    let db = new sqlite3.Database('db.db');
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
    if (!sentenceRepository.isLoaded)
    {
        res.render("stillLoading.ejs")
        return false
    }
    return true
}

app.set("view engine", "ejs")
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
        res.render("sentences.ejs", {
            firstBatchOfRandomSentences:
                sentenceRepository.getFullListOfRandomSentences()
                    .filter((x) =>
                    {
                        return !hiddenCharacters.has(x["char"])
                    })
                    .slice(0, 100)
                    .shuffle(), // TODO make some real pagination
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
        res.end(JSON.stringify(randomSentence))
        ut.log("Sent new sentence for character " + req.params.character)
    }
})
app.get("/kanjiDetail/:character", (req, res) =>
{
    if (!sentenceRepository.isLoaded)
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
        res.render("kanjiDetail.ejs", {
            character: req.params.character,
            sentences: sentences,
            readings: kanjidic.getKanjiReadings(req.params.character),
            meanings: kanjidic.getKanjiMeanings(req.params.character),
            exampleWords: sentences
                .map(x => x.jpn) // Exctract the kanji text from each sentence object
                .map(sentence => sentenceSplitter.split(sentence)) // Split each sentence, outputs an array of arrays of strings
                .reduce((acc, val) => acc.concat(val), []) // Flatten into a single array of strings
                .filter(x => x.match(new RegExp(req.params.character))) // Only keep the strings containing the relevant character
                .sort() // Remove duplicates (first sort, then use reduce() to make a new array without repeating the same values)
                .reduce((acc, val) =>
                {
                    if (acc[acc.length - 1] != val)
                        acc.push(val)
                    return acc
                }, [])
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

app.use(express.static('static'))
http.listen(8081, "0.0.0.0")
ut.log("Server running")
