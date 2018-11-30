// Jigen means 字源（漢字成り立ち）

const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

let dictionary = {}
let isLoaded = false
let callbacks = []

ut.log("Start loading jigen")

readline
    .createInterface({ input: fs.createReadStream("../datasets/jigen.csv") })
    .on("line", (line) =>
    {
        let char = line.charAt(0)
        let description = line.slice(2)
        dictionary[char] = description
    })
    .on("close", () =>
    {
        ut.log("Finished loading jigen")
        isLoaded = true
        callbacks.forEach(callback => callback())
        callbacks = null
    })

module.exports.getJigen = (char) =>
{
    return dictionary[char]
}

module.exports.isLoaded = () =>
{
    return isLoaded
}

module.exports.addLoadedCallback = (callback) =>
{
    if (isLoaded)
        callback()
    else
        callbacks.push(callback)
}
