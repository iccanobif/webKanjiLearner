const express = require('express')
const app = express()
const http = require('http').Server(app)
const fs = require('fs')
const readline = require('readline')
const sqlite3 = require("sqlite3")

function log(msg)
{
    let d = new Date()
    console.log("[" + d.toISOString() + "] " + msg)
}

function printError(e)
{
    log(e.message + " " + e.stack)
}

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
        if (!(char in this.sentences))
            return null

        let index = Math.floor((this.sentences[char].length - 1) * Math.random())
        return this.sentences[char][index]
    }

    this.loadSentences()
}

let sentenceRepository = new SentenceRepository()

let HiddenCharacterRepository = function ()
{
    let db = new sqlite3.Database('db.db');
    db.serialize(() =>
    {
        db.run("CREATE TABLE IF NOT EXISTS HIDDEN_CHARACTERS (USER_ID, CHARACTER)")
    })
    this.hideCharacter = (user, character) =>
    {
        log("Hiding character " + character + " for user " + user)
        db.run("INSERT INTO HIDDEN_CHARACTERS (USER_ID, CHARACTER) VALUES (?, ?)",
            [user, character],
            (err) =>
            {
                if (err) throw err
            })
    }
    this.unhideAllCharacters = (user) =>
    {
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err) =>
            {
                if (err) throw err
            })
    }
    // Call
    this.getHiddenCharacters = (user, callback) =>
    {
        db.all("SELECT CHARACTER FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err, rows) =>
            {
                if (err) throw err
                callback(new Set(rows.map((row) => row["CHARACTER"])))
            })
    }
}

let hiddenCharacterRepository = new HiddenCharacterRepository()
hiddenCharacterRepository.unhideAllCharacters("utente2")

app.set("view engine", "ejs")
app.get("/", (req, res) =>
{
    if (!sentenceRepository.isLoaded)
    {
        res.render("stillLoading.ejs")
    }
    else
    {
        hiddenCharacterRepository.getHiddenCharacters("USER", (hiddenCharacters) =>
        {
            res.render("index.ejs", {
                firstBatchOfRandomSentences: sentenceRepository.getFullListOfRandomSentences()
                    .filter((x) =>
                    {
                        return !hiddenCharacters.has(x["char"])
                    })
                    .slice(0, 200) // TODO make some real pagination
            })
        })
    }
})

app.get("/getRandomSentence/:char", (req, res) =>
{
    let randomSentence = sentenceRepository.getRandomSentence(req.params.char)
    if (randomSentence == null)
    {
        res.type("text/plain")
        res.status(404).end("Character not found.")
    }
    else
    {
        res.type("application/json")
        res.end(JSON.stringify(randomSentence))
    }
})

app.post("/hideCharacter", (req, res) =>
{
    let character = ""


    req.on("data", (data) =>
    {
        character += data
        if (character.length > 1)
        {
            res.type("text/plain")
            res.status(500)
            res.end("Too much data in the POST request, send only one character")
        }
    })
    req.on("end", () =>
    {
        hiddenCharacterRepository.hideCharacter("USER", character)
        res.type("text/plain")
        res.end()
    })
})

app.use(express.static('static', {
    "maxAge": 24 * 60 * 60 * 1000 // 1 day in milliseconds
}))

http.listen(8081, "0.0.0.0")

log("Server running")