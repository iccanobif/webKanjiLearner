const fs = require("fs");
const pako = require("pako")
const go = require("./go.js").go

fs.readdirSync("letters")
    .forEach((letter) => 
    {
        console.log(letter)
        const html = fs.readFileSync("letters/" + letter, { encoding: "utf8" })
        const regex = new RegExp('https://www.weblio.jp/content/.*?dictCode=SSDJJ"', 'g')
        
        while (m = regex.exec(html))
        {
            const url = m[0].replace('"', '').replace("')", "")

            fs.appendFileSync("lemma-urls.txt", url + "\n")
        }
    })