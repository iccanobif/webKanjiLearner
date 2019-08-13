const fs = require("fs")
const readline = require("readline")
const mongodb = require("mongodb")
const ut = require("./utils.js")

let callbacksToDoWhenReady = []
let isReady = false;

module.exports.initializeDb = async () => 
{
    // if (isReady)
    //     return false;
    const conn = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true })
    const db = conn.db("webKanjiLookup")
    const sentences = db.collection("sentences")

    if (await sentences.countDocuments() > 0)
    {
        isReady = true;
        callbacksToDoWhenReady.forEach(callback => callback())
        callbacksToDoWhenReady = [];
        conn.close()
        return false;
    }

    ut.log("Start loading sentences")

    // TODO add index
    readline
        .createInterface({ input: fs.createReadStream("../datasets/allSentences.csv") })
        .on("line", (line) =>
        {
            if (line.trim() == "")
                return;
            // Format:
            // {"char": "糞", "freq": 1, "jpn": "糞です", "kana": "くそです", "eng": "It's poop"}
            parsed = JSON.parse(line)
            sentences.insertOne(parsed)
        })
        .on("close", () =>
        {
            ut.log("Finished loading sentences")
            conn.close()
            isReady = true
            callbacksToDoWhenReady.forEach(callback => callback())
            callbacksToDoWhenReady = null
            return true;
        })
}

module.exports.initializeDb().catch(console.error);

module.exports.SentenceRepository = class
{
    constructor()
    {
        mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err, conn) =>
        {
            if (err) throw err;
            this.conn = conn;
            this.sentences = conn.db("webKanjiLookup").collection("sentences")
        })
        this.initializeDb = module.exports.initializeDb
    }

    // returns a promise
    dispose()
    {
        return this.conn.close(true);
    }


    async getAllSentences(char)
    {
        await this.initializeDb()
        return await this.sentences.find({ char: char }).toArray()
    }

    async getRandomSentence(char)
    {
        await this.initializeDb()
        const sentences = await this.sentences.find({ char: char }).toArray()
        if (sentences.length == 0)
            return null
        let index = Math.floor((sentences.length) * Math.random())
        return sentences[index]
    }
}