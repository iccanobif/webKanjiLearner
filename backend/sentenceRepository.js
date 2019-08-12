const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")
const bluebird = require("bluebird")
const redis = require("redis")
bluebird.promisifyAll(redis)

let callbacksToDoWhenReady = []
let isReady = false;


// I can wait for the dataset to be fully loaded by using redis, writing a message
// on a "message list" (??) to say that the sentence list is complete and making 
// getRandomSentence() and friends first read to it and waiting till it's ready
const redisClient = redis.createClient()

ut.log("Start loading sentences")

readline
    .createInterface({ input: fs.createReadStream("../datasets/allSentences.csv") })
    .on("line", (line) =>
    {
        if (line.trim() == "")
            return;
        // Format:
        // {"char": "糞", "freq": 1, "jpn": "糞です", "kana": "くそです", "eng": "It's poop"}
        const char = JSON.parse(line).char;
        redisClient.rpush("sentences:" + char, line)
    })
    .on("close", () =>
    {
        redisClient.quit()
        ut.log("Finished loading sentences")
        callbacksToDoWhenReady.forEach(callback => callback())
        callbacksToDoWhenReady = []
        isReady = true
    })

function doWhenReady(callback)
{
    if (isReady)
        callback()
    else
        callbacksToDoWhenReady.push(callback)
}

module.exports.SentenceRepository = class
{
    constructor()
    {
        // console.log("create")
        this.redisClient = redis.createClient()
    }

    dispose()
    {
        // console.log("destroy")
        this.redisClient.quit()
    }

    getFullListOfRandomSentences()
    {
        return new Promise((resolve, reject) =>
        {
            doWhenReady(async () =>
            {
                try
                {
                    const keys = await this.redisClient.keysAsync("sentences:*");
                    const output = []
                    for (let i = 0; i<keys.length; i++)
                    {
                        const sentences = await this.redisClient.lrangeAsync(keys[i], 0, -1)
                        let index = Math.floor((sentences.length) * Math.random())
                        output.push(JSON.parse(sentences[index]))
                    }
                    resolve(output)
                }
                catch (exc) {
                    reject(exc)
                }
            })
        })
    }

    getRandomSentence(char)
    {
        return new Promise((resolve, reject) =>
        {
            doWhenReady(() =>
            {
                //TODO add try catch?
                this.redisClient.lrange("sentences:" + char, 0, -1, (err, reply) =>
                {
                    if (err) reject(err)
                    else
                    {
                        if (reply.length == 0) resolve(null)
                        else 
                        {
                            let index = Math.floor((reply.length) * Math.random())
                            resolve(JSON.parse(reply[index]))
                        }
                    }
                })
            })
        })
    }

    getAllSentences(char)
    {
        return new Promise((resolve, reject) =>
        {
            doWhenReady(() =>
            {
                this.redisClient.lrange("sentences:" + char, 0, -1, (err, reply) =>
                {
                    if (err) reject(err)
                    else
                    {
                        resolve(reply.map(r => JSON.parse(r)))
                    }

                })
            })
        });
    }
}


