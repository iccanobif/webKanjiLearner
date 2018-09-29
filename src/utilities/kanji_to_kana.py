import subprocess
import romkan

def kanjiSentenceToKana(kanjiSentence):
    with open("tmp", "w", encoding="utf8") as f:
        f.write(kanjiSentence)
    result = subprocess.run("mecab tmp", stdout=subprocess.PIPE)
    stdout = result.stdout.decode("utf8")
    output = ""
    # The output has each word in the sentence in a separate line, with a few info
    # next to them as comma separated values. 
    # The reading is the second to last one (the last one is the pronounciation, they're
    # differents in cases like ヒョウロン (reading) vs ヒョーロン (pronounciation)
    for line in stdout.split("\n"):
        line = line.strip()
        if line == "EOS":
            break
        output += line.split(",")[-2]
        
    return romkan.katakana_to_hiragana(output)
