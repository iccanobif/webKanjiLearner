import libs.kanji_to_kana

# with open("inputs/sentences.csv", "r", encoding="utf8") as input:
#     with open("intermediateFiles/sentencesWithKana.csv", "w", encoding="utf8") as output:
#         for line in input:
#             line = line.strip()
#             sentenceId, language, sentenceText = line.split("\t")

with open("inputs/sentences.csv", "r", encoding="utf8") as input:
    for line in input:
        sentenceId, language, sentenceText = line.split("\t")
        sentenceText = sentenceText.strip()
        if language == "jpn"