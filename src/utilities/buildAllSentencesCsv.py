import requests
import os
import bz2

tmpDir = "../../inputs/"

blacklist = "︎ 　_-－—―〜・･,，、､；:：!！‼?？.．…。｡'‘’\"“”(（)）[]{}〈〉「｢」｣『』【】〔〕@*/／＼＆＃%％•※^゜°℃→∈+＋×=＝≠>~～−√∠⊂○♪⨯々ゝゞー$＄₪€0〇０1１①¹2２②²₂3３³4４5５6６7７8８9９" \
            + "AaａＡBbｂＢcCｃＣdDｄＤeEＥｅéFfＦｆgGｇＧhHＨｈIiＩｉJjｊＪkKＫｋlLｌＬMmｍＭNnＮｎOoｏＯºPpｐＰqQｑＱrRｒＲℝSsＳｓßTtＴｔuUｕＵÚvVｖＶwWｗＷXxｘＸyYＹｙzZＺｚαβ" \
            + "ぁあァアぃいィイぅうゥウヴぇえェエぉおォオかヵカがガきキぎギ㌔くクぐグ㌘けヶケげゲこコごゴさサざザしシじジ〆すスずズせセぜゼそソぞゾたタだダちチぢヂっつッツづヅてテでデとトどドなナにニ" \
            + "ぬヌねネのノはハばバぱパひヒびビぴピふフぶブぷプへヘべベぺペほホぼボぽポまマみミむムﾑめメもモゃやャヤゅゆュユょよョヨらラりリるルれレろロわワゐヸゑヱをヲんン​"

class Frase:
    def __init__(self, fraseInGiapponese, traduzioni):
        self.fraseInGiapponese = fraseInGiapponese
        self.traduzioni = traduzioni
        self.frequenzaMinima = None

def preparaFrasi():
    japaneseSentences = dict() # Key is a sentenceId, value is a Frase object
    englishSentences = dict() # Key is a sentenceId, value is a string

    frequenzaCaratteri = dict() # La chiave è un carattere giapponese, il valore è il numero di occorrenze nel dataset

    print("Parso sentences.tar.bz2")
    with bz2.open(tmpDir + "sentences.tar.bz2", "rt", encoding="utf8") as f:
        for line in f.readlines():
            splits = line.split("\t")
            if len(splits) != 3:
                print("skipping line " + line)
                continue
            sentenceId, language, sentenceText = splits
            sentenceText = sentenceText.strip()
            if language == "jpn":
                japaneseSentences[sentenceId] = Frase(sentenceText, [])

                for c in sentenceText:
                    if c in blacklist:
                        continue
                    if c in frequenzaCaratteri:
                        frequenzaCaratteri[c] += 1
                    else:
                        frequenzaCaratteri[c] = 1

            if language == "eng":
                englishSentences[sentenceId] = sentenceText

    print("Parso links.tar.bz2")
    with bz2.open(tmpDir + "links.tar.bz2", "rt", encoding="utf8") as links:
        for line in links.readlines():
            splits = line.strip().split("\t")
            if len(splits) != 2:
                print("skipping line " + line)
                continue
            id1, id2 = line.strip().split("\t")
            if id1 in japaneseSentences and id2 in englishSentences:
                japaneseSentences[id1].traduzioni.append(englishSentences[id2])

    print("Calcolo frequenza carattere meno frequente per ogni frase")
    for frase in japaneseSentences.values():
        frase.frequenzaMinima = None
        for c in frase.fraseInGiapponese:
            if c in blacklist:
                continue
            if frase.frequenzaMinima is None or frequenzaCaratteri[c] < frase.frequenzaMinima:
                frase.frequenzaMinima = frequenzaCaratteri[c]
    return japaneseSentences.values(), frequenzaCaratteri

# Download raw datasets from tatoeba

try:
    os.mkdir(tmpDir)
except:
    pass

for file in [("http://downloads.tatoeba.org/exports/sentences.tar.bz2", "sentences.tar.bz2"),\
             ("http://downloads.tatoeba.org/exports/links.tar.bz2", "links.tar.bz2")]:
    if os.path.exists(tmpDir + file[1]):
        print(file[1] + " already exists... not downloading.")
        continue

    print("downloading " + file[0])
    r = requests.get(file[0])
    f = open(tmpDir + file[1],"wb")
    f.write(r.content)
    f.close

frasi, frequenzaCaratteri = preparaFrasi()
# Le frasi di un carattere sono tutte le frasi in cui quel carattere è il piu' difficile che hanno

def makeJson(carattere, fraseGiapponese, traduzione):
    return """{"char": "%s", "freq": %d, "jpn": "%s", "eng": "%s"}""" \
            % (carattere, frequenzaCaratteri[carattere], fraseGiapponese.replace("\"", "\\\""), traduzione.replace("\"", "\\\""))

print("Preparing mapping")
with open("../../datasets/allSentences.csv", "w", encoding="utf8") as f:
    for c in sorted(frequenzaCaratteri.keys(), key=lambda x: frequenzaCaratteri[x]):
        print("Doing character", c, frequenzaCaratteri[c])
        f.write("\n".join([makeJson(c, frase.fraseInGiapponese, traduzione) \
                           for frase \
                           in frasi \
                           if frase.fraseInGiapponese.find(c) >= 0 and frase.frequenzaMinima == frequenzaCaratteri[c] \
                           for traduzione \
                           in frase.traduzioni]) \
        + "\n")
        