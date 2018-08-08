import kanji_to_kana

blacklist = "︎ 　_-－—―〜・･,，、､；:：!！‼?？.．…。｡'‘’\"“”(（)）[]{}〈〉「｢」｣『』【】〔〕@*/／＼＆＃%％•※^゜°℃→∈+＋×=＝≠>~～−√∠⊂○♪⨯々ゝゞー$＄₪€0〇０1１①¹2２②²₂3３³4４5５6６7７8８9９" \
            + "AaａＡBbｂＢcCｃＣdDｄＤeEＥｅéFfＦｆgGｇＧhHＨｈIiＩｉJjｊＪkKＫｋlLｌＬMmｍＭNnＮｎOoｏＯºPpｐＰqQｑＱrRｒＲℝSsＳｓßTtＴｔuUｕＵÚvVｖＶwWｗＷXxｘＸyYＹｙzZＺｚαβ" \
            + "ぁあァアぃいィイぅうゥウヴぇえェエぉおォオかヵカがガきキぎギ㌔くクぐグ㌘けヶケげゲこコごゴさサざザしシじジ〆すスずズせセぜゼそソぞゾたタだダちチぢヂっつッツづヅてテでデとトどドなナにニ" \
            + "ぬヌねネのノはハばバぱパひヒびビぴピふフぶブぷプへヘべベぺペほホぼボぽポまマみミむムﾑめメもモゃやャヤゅゆュユょよョヨらラりリるルれレろロわワゐヸゑヱをヲんン​"

class Frase:
    def __init__(self, fraseInGiapponese, traduzioni):
        self.fraseInGiapponese = fraseInGiapponese
        self.traduzioni = traduzioni
        self.fraseInGiapponeseInKana = kanji_to_kana.kanjiSentenceToKana(fraseInGiapponese)
        self.frequenzaMinima = None

def preparaFrasi():
    japaneseSentences = dict()
    englishSentences = dict()
    frequenzaCaratteri = dict() # La chiave è un carattere giapponese, il valore è il numero di occorrenze nel dataset
    frasi = dict()

    print("Parso sentences.csv")
    with open("sentences.csv", "r", encoding="utf8") as f:
        for line in f.readlines():
            split = line.strip().split("\t")
            if split[1] == "jpn":
                japaneseSentences[split[0]] = split[2]
                for c in split[2]:
                    if c in blacklist:
                        continue
                    if c in frequenzaCaratteri:
                        frequenzaCaratteri[c] += 1
                    else:
                        frequenzaCaratteri[c] = 1
            if split[1] == "eng":
                englishSentences[split[0]] = split[2]

    print("Parso links.csv")
    with open("links.csv", "r", encoding="utf8") as links:
        for line in links.readlines():
            split = line.strip().split("\t")
            if split[0] in japaneseSentences and split[1] in englishSentences:
                fraseGiapponese = japaneseSentences[split[0]]
                fraseInglese = englishSentences[split[1]]
                if fraseGiapponese in frasi:
                    frasi[fraseGiapponese].traduzioni.append(fraseInglese)
                else:
                    frasi[fraseGiapponese] = Frase(fraseGiapponese, [fraseInglese])

    print("Calcolo frequenza carattere meno frequente per ogni frase")
    for frase in frasi.values():
        frase.frequenzaMinima = None
        for c in frase.fraseInGiapponese:
            if c in blacklist:
                continue
            if frase.frequenzaMinima is None or frequenzaCaratteri[c] < frase.frequenzaMinima:
                frase.frequenzaMinima = frequenzaCaratteri[c]
    return frasi.values(), frequenzaCaratteri

frasi, frequenzaCaratteri = preparaFrasi()
# Le frasi di un carattere sono tutte le frasi in cui quel carattere è il piu' difficile che hanno

def makeJson(carattere, fraseGiapponese, fraseInGiapponeseInKana, traduzione):
    return """["char": "%s", "freq": %d, jpn": "%s", "kana": "%s", "eng": "%s"]""" \
            % (carattere, frequenzaCaratteri[carattere], fraseGiapponese, fraseInGiapponeseInKana, traduzione)

print("Preparing mapping")
with open("frasi giapponesi 2.csv", "w", encoding="utf8") as f:
    for c in sorted(frequenzaCaratteri.keys(), key=lambda x: frequenzaCaratteri[x]):
        print("Doing character", c, frequenzaCaratteri[c])
        f.write("\n".join([makeJson(c, frase.fraseInGiapponese, frase.fraseInGiapponeseInKana, traduzione) \
                           for frase \
                           in frasi \
                           if frase.fraseInGiapponese.find(c) >= 0 and frase.frequenzaMinima == frequenzaCaratteri[c] \
                           for traduzione \
                           in frase.traduzioni]) \
        + "\n")
        