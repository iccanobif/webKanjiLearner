const Kuroshiro = require("kuroshiro")
const kuroshiro = new Kuroshiro()

const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji")
console.log("Initializing")
kuroshiro.init(new KuromojiAnalyzer()).then(() =>
{
    console.log("Initialized")
    kuroshiro.convert("感じ取れたら手を繋ごう、重なるのは人生のライン and レミリア最高！", { to: "hiragana" }).then((result) =>
    {
        console.log(result)
    })
})