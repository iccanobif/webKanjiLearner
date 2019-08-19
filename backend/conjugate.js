const unsupportedConjugations = new Set(["v5", "v5aru", "v5r-i", "v5u-s", "v5uru"])
const partOfSpeechWhitelist = new Set("v1|v5aru|v5b|v5g|v5k-s|v5k|v5m|v5n|v5r-i|v5r|v5s|v5t|v5u-s|v5uru|v5u|v5|adj-ix|adj-i|vs-s|vs-i".split("|"))

module.exports.conjugate = (kanjiWord, kanaWord, partOfSpeech) =>
{
    if (partOfSpeech == null)
        return []
    if (!partOfSpeechWhitelist.has(partOfSpeech))
        return []
    if (unsupportedConjugations.has(partOfSpeech))
        return [] // I don't know how to conjugate this stuff (yet)

    let newWords = []

    function add(suffix, charactersToTrim)
    {
        // Add to the output the original word replacing the last charactersToTrim characters with the suffix provided
        if (typeof charactersToTrim === "undefined")
            charactersToTrim = 1

        newWords.push({
            kanjiElement: kanjiWord == null ? null : kanjiWord.slice(0, kanjiWord.length - charactersToTrim) + suffix,
            readingElement: kanaWord == null ? null : kanaWord.slice(0, kanaWord.length - charactersToTrim) + suffix
        })
    }

    if (partOfSpeech == "vs-s" || partOfSpeech == "vs-i")
    {
        "し、します、しました、しません、しない、すれば、しよう、して、している、してる、しなかった、される、させる、しろ、した、したい、せず、しぬ"
            .split("、")
            .forEach(suffix => add(suffix, 2))
        return newWords
    }

    switch (partOfSpeech)
    {
        case "adj-i":
            add("くない") // negative
            add("く")    // adverbial form
            add("かった") // past
            add("くなかった") // past negative
            add("くて") // te-form
            add("すぎる") // too much
            add("過ぎる") // too much
            add("すぎ") // too much
            add("そう") // looks like it's...
            add("さ") // nominalization
            break;
        case "adj-ix":
            add("よくない", 2) // negative
            add("よく", 2) // adverbial form
            add("よかった", 2) // past
            add("よくなかった", 2) // past negative
            add("よくて", 2) // te-form
            break;
        case "v1":
            add("") // stem
            add("ます") // masu-form
            add("ました") // masu-form
            add("ません") // masu-form
            add("ない") // negative
            add("た") // past
            add("なかった") // past negative
            add("て") // -te form
            add("ている") // -te+iru form
            add("てる") // -teiru form (informal)
            add("られる") // potential + passive (they're the same for ichidan verbs...)
            add("させる") // causative
            add("よう") // volitive
            add("たい") // tai-form
            add("ず") // zu-form
            add("ろ") // imperative
            add("ぬ") // archaic negative
            add("ちゃう"); add("ちゃった"); add("ちゃって"); // contraction of て+しまう
            break;
        case "v5s":
            add("した") // past
            add("して") // -te form
            add("している") // -te+iru form
            add("してる") // -te+iru form (informal)
            break;
        case "v5k":
            add("いた") // past
            add("いて") // -te form
            add("いている") // -te+iru form
            add("いてる") // -te+iru form (informal)
            break;
        case "v5g":
            add("いだ") // past
            add("いで") // -te form
            add("いでいる") // -te+iru form
            add("いでる") // -te+iru form (informal)
            break;
        case "v5k-s": // for verbs ending in 行く
            add("った") // past
            add("いて") // -te form
            add("いている") // -te+iru form
            add("いてる") // -te+iru form (informal)
            break;
        case "v5b":
        case "v5m":
        case "v5n":
            add("んだ") // past
            add("んで") // -te form
            add("んている") // -te+iru form
            add("んてる") // -te+iru form (informal)
            break;
        case "v5r":
        case "v5t":
        case "v5u":
            add("った") // past
            add("って") // -te form
            add("っている") // -te+iru form
            add("ってる") // -te+iru form (informal)
    }

    let firstNegativeKana = ""
    let stemKana = ""

    switch (partOfSpeech)
    {
        case "v5k-s": // potential // volitive // imperative  
        case "v5k": add("ける"); add("こう"); add("け"); stemKana = "き"; firstNegativeKana = "か"; break;
        case "v5g": add("げる"); add("ごう"); add("げ"); stemKana = "ぎ"; firstNegativeKana = "が"; break;
        case "v5b": add("べる"); add("ぼう"); add("べ"); stemKana = "び"; firstNegativeKana = "ば"; break;
        case "v5m": add("める"); add("もう"); add("め"); stemKana = "み"; firstNegativeKana = "ま"; break;
        case "v5n": add("ねる"); add("のう"); add("ね"); stemKana = "に"; firstNegativeKana = "な"; break;
        case "v5r": add("れる"); add("ろう"); add("れ"); stemKana = "り"; firstNegativeKana = "ら"; break;
        case "v5t": add("てる"); add("とう"); add("て"); stemKana = "ち"; firstNegativeKana = "た"; break;
        case "v5u": add("える"); add("おう"); add("え"); stemKana = "い"; firstNegativeKana = "わ"; break;
        case "v5s": add("せる"); add("そう"); add("せ"); stemKana = "し"; firstNegativeKana = "さ"; break;
    }

    if (partOfSpeech.startsWith("v5"))
    {
        add(firstNegativeKana + "ない")  // negative
        add(firstNegativeKana + "なかった")  // past negative
        add(firstNegativeKana + "せる")  // causative
        add(firstNegativeKana + "れる")  // passive
        add(firstNegativeKana + "ず")  // zu-form
        add(firstNegativeKana + "ぬ")  // archaic negative
        add(firstNegativeKana)  // 未然形

        add(stemKana) // stem
        add(stemKana + "たい") // tai-form
        add(stemKana + "ます") // masu-form
        add(stemKana + "ました") // masu-form (past)
        add(stemKana + "ません") // masu-form (negative)
        add(stemKana + "ちゃう"); add(stemKana + "ちゃった"); add(stemKana + "ちゃって")
    }

    return newWords
}