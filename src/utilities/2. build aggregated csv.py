blacklist = "︎ 　_-－—―〜・･,，、､；:：!！‼?？.．…。｡'‘’\"“”(（)）[]{}〈〉「｢」｣『』【】〔〕@*/／＼＆＃%％•※^゜°℃→∈+＋×=＝≠>~～−√∠⊂○♪⨯々ゝゞー$＄₪€0〇０1１①¹2２②²₂3３³4４5５6６7７8８9９" \
            + "AaａＡBbｂＢcCｃＣdDｄＤeEＥｅéFfＦｆgGｇＧhHＨｈIiＩｉJjｊＪkKＫｋlLｌＬMmｍＭNnＮｎOoｏＯºPpｐＰqQｑＱrRｒＲℝSsＳｓßTtＴｔuUｕＵÚvVｖＶwWｗＷXxｘＸyYＹｙzZＺｚαβ" \
            + "ぁあァアぃいィイぅうゥウヴぇえェエぉおォオかヵカがガきキぎギ㌔くクぐグ㌘けヶケげゲこコごゴさサざザしシじジ〆すスずズせセぜゼそソぞゾたタだダちチぢヂっつッツづヅてテでデとトどドなナにニ" \
            + "ぬヌねネのノはハばバぱパひヒびビぴピふフぶブぷプへヘべベぺペほホぼボぽポまマみミむムﾑめメもモゃやャヤゅゆュユょよョヨらラりリるルれレろロわワゐヸゑヱをヲんン​"

class Frase:
    def __init__(self, fraseInGiapponese, fraseInKana, traduzioni):
        self.fraseInGiapponese = fraseInGiapponese
        self.traduzioni = traduzioni
        self.fraseInGiapponeseInKana = fraseInKana
        self.frequenzaMinima = None

def preparaFrasi():
    japaneseSentences = dict() # Key is a sentenceId, value is a Frase object
    englishSentences = dict() # Key is a sentenceId, value is a string

    frequenzaCaratteri = dict() # La chiave è un carattere giapponese, il valore è il numero di occorrenze nel dataset

    print("Parso sentences.csv")
    with open("intermediateFiles/sentencesWithKana.csv", "r", encoding="utf8") as f:
        for line in f.readlines():
            sentenceId, language, sentenceText, sentenceKana = line.split("\t")
            sentenceKana = sentenceKana.strip()
            if language == "jpn":
                japaneseSentences[sentenceId] = Frase(sentenceText, sentenceKana, [])

                for c in sentenceText:
                    if c in blacklist:
                        continue
                    if c in frequenzaCaratteri:
                        frequenzaCaratteri[c] += 1
                    else:
                        frequenzaCaratteri[c] = 1

            if language == "eng":
                englishSentences[sentenceId] = sentenceText

    print("Parso links.csv")
    with open("inputs/links.csv", "r", encoding="utf8") as links:
        for line in links.readlines():
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

frasi, frequenzaCaratteri = preparaFrasi()
# Le frasi di un carattere sono tutte le frasi in cui quel carattere è il piu' difficile che hanno

def makeJson(carattere, fraseGiapponese, fraseInGiapponeseInKana, traduzione):
    return """{"char": "%s", "freq": %d, "jpn": "%s", "kana": "%s", "eng": "%s"}""" \
            % (carattere, frequenzaCaratteri[carattere], fraseGiapponese.replace("\"", "\\\""), fraseInGiapponeseInKana.replace("\"", "\\\""), traduzione.replace("\"", "\\\""))

print("Preparing mapping")
with open("output/allSentences.csv", "w", encoding="utf8") as f:
    for c in sorted(frequenzaCaratteri.keys(), key=lambda x: frequenzaCaratteri[x]):
        print("Doing character", c, frequenzaCaratteri[c])
        f.write("\n".join([makeJson(c, frase.fraseInGiapponese, frase.fraseInGiapponeseInKana, traduzione) \
                           for frase \
                           in frasi \
                           if frase.fraseInGiapponese.find(c) >= 0 and frase.frequenzaMinima == frequenzaCaratteri[c] \
                           for traduzione \
                           in frase.traduzioni]) \
        + "\n")
        