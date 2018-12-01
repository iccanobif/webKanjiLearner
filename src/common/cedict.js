// CC-CEDICT entry samples:
// 一時半刻 一时半刻 [yi1 shi2 ban4 ke4] /a short time/a little while/

const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

let dictionary = {}
let isLoaded = false
let callbacks = []

ut.log("Start loading cedict")

readline
    .createInterface({ input: fs.createReadStream("../datasets/cedict_ts.u8") })
    .on("line", (line) =>
    {
        if (line.charAt(0) == "#")
            return // Ignore comments
        const i = line.indexOf(" ")
        const traditional = line.substring(0, i)
        const simplified = line.substring(i + 1, line.indexOf(" ", i + 1))

        ut.addToDictionaryOfLists(dictionary, traditional, line)

        if (traditional != simplified)
            ut.addToDictionaryOfLists(dictionary, simplified, line)
    })
    .on("close", () =>
    {
        ut.log("Finished loading cedict")
        isLoaded = true
        callbacks.forEach(callback => callback())
        callbacks = null
    })

module.exports.isLoaded = () =>
{
    return isLoaded
}

module.exports.getDefinitions = (word) =>
{
    if (word in dictionary)
        return dictionary[word]
    else
        return []
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isLoaded)
        callback()
    else
        callbacks.push(callback)
}
