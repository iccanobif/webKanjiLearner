const fs = require("fs")
const readline = require("readline")
const axios = require('axios');
const pako = require("pako")
const asyncsema = require("async-sema")

const sema = new asyncsema.Sema(10)

readline
    .createInterface({ input: fs.createReadStream("lemmaUrls.txt") })
    .on("line", async (line) =>
    {
        await sema.acquire()
        line.trim()
        console.log("downloading " + line)

        let response = await axios.get(line)
        console.log("Compressing")
        pako.gzip(response.data)
    })
    .on("close", () =>
    {
        ut.log("DONE")
    })

