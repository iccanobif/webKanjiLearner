import libs.kanji_to_kana

with open("inputs/sentences.csv", "r", encoding="utf8") as input:
    with open("intermediateFiles/sentencesWithKana.csv", "w", encoding="utf8") as output:
        for line in input:
            sentenceId, language, sentenceText = line.strip().split("\t")
            if language not in ["eng", "jpn"]:
                continue
            sentenceKana = libs.kanji_to_kana.kanjiSentenceToKana(sentenceText) if language == "jpn" else ""
            output.write("%s\t%s\t%s\t%s\n" % (sentenceId, language, sentenceText, sentenceKana))