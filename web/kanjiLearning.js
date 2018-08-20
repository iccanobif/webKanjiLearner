const express = require("express")
const app = express()
const http = require("http").Server(app)
const fs = require("fs")
const readline = require("readline")
const sqlite3 = require("sqlite3")
const bodyParser = require("body-parser");
const kanjidic = require("./kanjidic.js")
const ut = require("./utils.js")

const maxPostDataLength = 10000

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
                ut.log("Finished loading datasets")
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
        ut.log("Hiding character " + character + " for user " + user)
        db.run("INSERT INTO HIDDEN_CHARACTERS (USER_ID, CHARACTER) VALUES (?, ?)",
            [user, character],
            (err) =>
            {
                if (err) printError(err)
            })
    }
    this.unhideAllCharacters = (user) =>
    {
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err) =>
            {
                if (err) printError(err)
            })
    }
    // Call
    this.getHiddenCharacters = (user, callback) =>
    {
        db.all("SELECT CHARACTER FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err, rows) =>
            {
                if (err)
                {
                    printError(err)
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

app.set("view engine", "ejs")
app.get("/", (req, res) =>
{
    res.render("login.ejs")
})
app.post("/sentences", (req, res) =>
{
    if (!sentenceRepository.isLoaded)
    {
        res.render("stillLoading.ejs")
    }
    else
    {
        hiddenCharacterRepository.getHiddenCharacters(req.body.userName, (hiddenCharacters) =>
        {
            res.render("index.ejs", {
                firstBatchOfRandomSentences: sentenceRepository.getFullListOfRandomSentences()
                    .filter((x) =>
                    {
                        return !hiddenCharacters.has(x["char"])
                    })
                    .slice(0, 200), // TODO make some real pagination
                userName: req.body.userName
            })
        })
    }
})
app.get("/sentences", (req, res) =>
{
    res.redirect("/")
})

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
        ut.log("Sent new sentence for character " + req.params.char)
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
        res.render("kanjiDetail.ejs", {
            character: req.params.character,
            sentences: sentenceRepository.getAllSentences(req.params.character)
                .sort((a, b) =>
                {
                    return a.jpn.localeCompare(b.jpn)
                }),
            readings: kanjidic.getKanjiReadings(req.params.character),
            meanings: kanjidic.getKanjiMeanings(req.params.character)
        })
    }
})

app.post("/hideCharacter", (req, res) =>
{
    hiddenCharacterRepository.hideCharacter(req.body.userId, req.body.character)
    res.type("text/plain")
    res.end()
})

app.use(express.static('static'))

http.listen(8081, "0.0.0.0")

ut.log("Server running")
