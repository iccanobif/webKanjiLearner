const assert = require("assert")
const edict = require("../edict.js")
const ut = require("../utils.js")
const sentenceSplitter = require("../sentenceSplitter.js")
const kanjidic = require("../kanjidic.js")
const jigen = require("../jigen.js")
const cedict = require("../cedict.js")
const sentenceRepository = require("../sentenceRepository.js")
const redis = require("redis")

describe("tests", function () 
{
  before((done) =>
  {
    const redisClient = redis.createClient()
    redisClient.flushall(done)
    redisClient.quit()
  })


  describe("utils", function ()
  {
    describe("uniq()", () =>
    {
      it("should work lol", () =>
      {
        assert.deepStrictEqual([1, 2, 3], [2, 2, 1, 3].uniq())
      })
    })
    describe("addToDictionaryOfLists()", () =>
    {
      it("should add values for new keys", () =>
      {
        let dictionary = {}
        ut.addToDictionaryOfLists(dictionary, "key", "value")
        assert.deepStrictEqual(dictionary["key"], ["value"])
      })
      it("should add values for existing keys", () =>
      {
        let dictionary = {}
        ut.addToDictionaryOfLists(dictionary, "key", "value1")
        ut.addToDictionaryOfLists(dictionary, "key", "value2")
        assert.deepStrictEqual(dictionary["key"], ["value1", "value2"])
      })
    })
    describe("addToDictionaryOfSets()", () =>
    {
      it("should add values for new keys", () =>
      {
        let set = new Set()
        assert.ok(!("key" in set))
        ut.addToDictionaryOfSets(set, "key", "value")
        assert.ok(("key" in set))
      })
      it("should add values for existing keys", () =>
      {
        let set = new Set()
        ut.addToDictionaryOfSets(set, "key", "value1")
        ut.addToDictionaryOfSets(set, "key", "value2")
        assert.deepStrictEqual(Array.from(set["key"]).sort(), ["value1", "value2"])
      })
      it("should keep only one copy of a value added more than once", () =>
      {
        let set = new Set()
        ut.addToDictionaryOfSets(set, "key", "value1")
        ut.addToDictionaryOfSets(set, "key", "value1")
        assert.deepStrictEqual(Array.from(set["key"]), ["value1"])
      })
    })
    describe("katakanaToHiragana()", () =>
    {
      it("should convert all katakana in a sentence to hiragana", () =>
      {
        assert.equal(ut.katakanaToHiragana("English 漢字　カタカナ　ひらがな"), "English 漢字　かたかな　ひらがな")
        let allKatakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ"
        let allHiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ"
        assert.equal(ut.katakanaToHiragana(allKatakana + allHiragana), allHiragana + allHiragana)
      })
    })
  })

  describe("kanjidic", function () 
  {
    before((done) =>
    {
      kanjidic.addLoadedCallback(done)
    })
    it("should get kanji readings", () =>
    {
      assert.deepEqual(kanjidic.getKanjiReadings("逢"), "ホウ あ.う むか.える あい おう".split(" "))
    })
    it("should get kanji meanings", () =>
    {
      assert.deepEqual(kanjidic.getKanjiMeanings("逢"), "meeting tryst date rendezvous".split(" "))
    })
  })

  describe('edict', function ()
  {
    this.timeout(20000)
    before((done) =>
    {
      edict.addLoadedCallback(done)
    })
    describe('isJapaneseWord()', () =>
    {
      it('should recognize base forms ', () => { assert.ok(edict.isJapaneseWord("食べる")) })
      it('should recognize past forms ', () => { assert.ok(edict.isJapaneseWord("食べた")) })
      it('should not recognize non-existing words ', () => { assert.ok(!edict.isJapaneseWord("fdsarv")) })
      it('そう for for i-adj ', () => { assert.ok(edict.isJapaneseWord("強そう")) })
      it('すぎる for for i-adj ', () => { assert.ok(edict.isJapaneseWord("強すぎる")) })
      describe("imperative forms", () =>
      {
        it('v1', () => { assert.ok(edict.isJapaneseWord("食べろ")) })
        it('v5s', () => { assert.ok(edict.isJapaneseWord("隠せ")) })
        it('v5k', () => { assert.ok(edict.isJapaneseWord("置け")) })
        it('v5g', () => { assert.ok(edict.isJapaneseWord("泳げ")) })
        it('v5k-s', () => { assert.ok(edict.isJapaneseWord("持っていけ")) })
        it('v5b', () => { assert.ok(edict.isJapaneseWord("学べ")) })
        it('v5m', () => { assert.ok(edict.isJapaneseWord("飲め")) })
        it('v5n', () => { assert.ok(edict.isJapaneseWord("死ね")) })
        it('v5r', () => { assert.ok(edict.isJapaneseWord("謝れ")) })
        it('v5t', () => { assert.ok(edict.isJapaneseWord("待て")) })
        // Do imperatives exist for v5u??
      })
      it("should conjugate 湿気る both as a v1 and as a v5r", () =>
      {
        assert.ok(edict.isJapaneseWord("湿気た"))
        assert.ok(edict.isJapaneseWord("湿気った"))
      })
      it("should conjugate ぬ (negative) verb forms too", () =>
      {
        assert.ok(edict.isJapaneseWord("知らぬ"))
        assert.ok(edict.isJapaneseWord("出来ぬ"))
        assert.ok(edict.isJapaneseWord("食べぬ"))
      })
      it("Conjugate verbs to their 未然形 form too, so that something like 言わなければならない at least gets the 言わ part clickable and pointing to 言う", () =>
      {
        assert.ok(edict.isJapaneseWord("言わ"))
      })
      it("should conjugate vs-s verbs", () =>
      {
        assert.ok(edict.isJapaneseWord("面した"))
        assert.ok(edict.isJapaneseWord("しなかった"))
      })
    })
    describe("getDefinition()", () =>
    {
      it("should get the definitions of unconjugated words", () =>
      {
        let definitions = edict.getDefinitions("食べる")
        assert.equal(definitions.length, 1)
      })
      it("should get the definitions of conjugated words", () =>
      {
        let definitions = edict.getDefinitions("泳いだ")
        assert.equal(definitions.length, 1)
        assert.ok(definitions[0].kanjiElements.includes("泳ぐ"))
      })
      it("should get more than one definition for ambiguous pronounciations", () =>
      {
        let definitions = edict.getDefinitions("かんじょう")
        assert.ok(definitions.length > 1)
        assert.ok(definitions.filter((x) => x.kanjiElements.includes("感情")).length = 1)
        assert.ok(definitions.filter((x) => x.kanjiElements.includes("勘定")).length = 1)
      })
      it("should return an empty array when asked for a word that's not in the dictionary", () =>
      {
        assert.deepStrictEqual([], edict.getDefinitions("this is not a word"))
      })
      it("should return a definition object with a kanjiElements property ", () =>
      {
        let definitions = edict.getDefinitions("食べる")
        assert.ok(definitions[0].kanjiElements.includes("食べる"))
      })
      it("should return a definition object with a readingElements property ", () =>
      {
        let definitions = edict.getDefinitions("食べる")
        assert.ok(definitions[0].readingElements.includes("たべる"))
      })
      it("should return a definition object with a glosses property ", () =>
      {
        let definitions = edict.getDefinitions("食べる")
        assert.ok(definitions[0].glosses.includes("to eat"))
      })
      it("should provide readings in the correct order (the more common first, the least common last)", () =>
      {
        let definitions = edict.getDefinitions("輸出")
        assert.deepStrictEqual(definitions[0].readingElements, ["ゆしゅつ", "しゅしゅつ"])
      })
    })
    describe("getBaseForms", () =>
    {
      it("should get the base form of a conjugated verb (kanji)", () =>
      {
        assert.deepStrictEqual(edict.getBaseForms("食べられる"), ["食べる"])
        assert.deepStrictEqual(edict.getBaseForms("食べた"), ["食べる"])
      })
      it("should get the base form of a conjugated verb (kana)", () =>
      {
        assert.deepStrictEqual(edict.getBaseForms("たべられる"), ["たべる"])
      })
      it("should get all possible base forms in case of ambiguity", () =>
      {
        let baseForms = edict.getBaseForms("いった")
        assert.equal(3, baseForms.length)
        assert.ok(baseForms.includes("いく"))
        assert.ok(baseForms.includes("いう"))
        assert.ok(baseForms.includes("いる"))
      })
    })
    describe("getReadings()", () =>
    {
      function checkKanjiWithOnlyOnePossibleReading(word, reading)
      {
        let readings = edict.getReadings(word, true)
        assert.equal(readings.length, 1)
        assert.equal(readings[0], reading)
      }
      it("should convert uninflected kanji words to kana correctly", () =>
      {
        checkKanjiWithOnlyOnePossibleReading("食べる", "たべる")
      })
      it("should convert inflected kanji words to kana correctly", () =>
      {
        checkKanjiWithOnlyOnePossibleReading("食べた", "たべた")
      })
      it("should use re_restr to map each reading to the correct kanji form", () =>
      {
        checkKanjiWithOnlyOnePossibleReading("この上なく", "このうえなく")
      })
      it("should just return わたし for 私, when asking for filtered readings", () =>
      {
        checkKanjiWithOnlyOnePossibleReading("私", "わたし")
        assert.ok(edict.getReadings("私", false).length > 1)
      })
      it("should return only hiragana readings, even if edict also lists a katakana one", () =>
      {
        checkKanjiWithOnlyOnePossibleReading("犬", "いぬ")
      })
      it("should return numbers when fed numbers", () =>
      {
        for (let i = 0; i < 10; i++)
        {
          let num = String.fromCodePoint("１".codePointAt(0) + i)
          checkKanjiWithOnlyOnePossibleReading(num, num)
        }
      })
    })
  })

  describe("splitter", function ()
  {
    before((done) =>
    {
      edict.addLoadedCallback(done)
    })
    it("should split correctly when the longest word is at the beginning", () =>
    {
      assert.deepStrictEqual(["よろしく", "ね"], sentenceSplitter.split("よろしくね"))
    })
    // it("should split correctly when the longest word is at the end", () =>
    // {
    //   assert.deepStrictEqual(["たくさん", "の", "ヨット", "が", "港", "に", "はいってる"], sentenceSplitter.split("たくさんのヨットが港にはいってる"))
    // })
    it("in doubt, prioritize the left", () =>
    {
      assert.deepStrictEqual(["ただ", "の"], sentenceSplitter.split("ただの"))
    })
    it("shouldn't time out while splitting a longish sentence", () =>
    {
      sentenceSplitter.split("※基本的な禁止事項（誹謗・中傷の禁止等）は「はじめにお読み下さい」に記載してあります。必ずお読みください。")
      assert.ok(true)
    })
    it("shouldn't mix a particle with the following word (usually happens when the word is in hiragana)", () =>
    {
      assert.deepStrictEqual(sentenceSplitter.split("大災害をもたらした。"),
        ["大災害", "を", "もたらした", "。"])
      assert.deepStrictEqual(sentenceSplitter.split("蜘蛛が部屋にいるの！早く退治してちょうだい！"),
        ["蜘蛛", "が", "部屋", "に", "いる", "の", "！", "早く", "退治", "して", "ちょうだい", "！"])
      assert.deepStrictEqual(sentenceSplitter.split("彼女の行動はしだいに攻撃的になってくるだろう。"),
        ["彼女", "の", "行動", "は", "しだいに", "攻撃的", "になって", "くる", "だろう", "。"])
      assert.deepStrictEqual(sentenceSplitter.split("その男は頑としてその職にしがみつき、決して退職しようとはしなかった。"),
        ["その", "男", "は", "頑として", "その", "職", "に", "しがみつき", "、", "決して", "退職", "しよう", "とは", "しなかった", "。"])
    })
    it("should split 経験する correctly (can't remember why, but it used to be split wrong)", () =>
    {
      assert.deepStrictEqual(sentenceSplitter.split("経験する"),
        ["経験", "する"])
    })
    // Stuff that's currently not split properly:
    // 証人が事実を隠せば刑法の罪に問われる。
  })
  describe('jigen', function ()
  {
    this.timeout(20000)
    before((done) =>
    {
      jigen.addLoadedCallback(done)
    })
    describe('getJigen()', () =>
    {
      it("should return the jigen description", () =>
      {
        assert.strictEqual(jigen.getJigen("水"), "成り立ち象形文字です。「流れる水」の象形から、「みず」を意味する「水」という漢字が成り立ちました。")
      })
    })
  })

  describe('cedict', function ()
  {
    this.timeout(20000)
    before((done) =>
    {
      cedict.addLoadedCallback(done)
    })
    describe('getDefinitions()', () =>
    {
      it("should return the definition of a certain kanji ", () =>
      {
        const definitions = cedict.getDefinitions("誰")
        assert.equal(definitions.length, 1)
        assert.strictEqual(definitions[0], "誰 谁 [shei2] /who/also pr. [shui2]/")
      })
      it("should also work with words of more than one character", () =>
      {
        const definitions = cedict.getDefinitions("電話")
        assert.equal(definitions.length, 1)
        assert.strictEqual(definitions[0], "電話 电话 [dian4 hua4] /telephone/CL:部[bu4]/phone call/CL:通[tong1]/phone number/")
      })
      it("should work with simplified characters", () =>
      {
        const definitions = cedict.getDefinitions("电话")
        assert.equal(definitions.length, 1)
        assert.strictEqual(definitions[0], "電話 电话 [dian4 hua4] /telephone/CL:部[bu4]/phone call/CL:通[tong1]/phone number/")
      })
    })
  })


  describe('sentenceRepository', function ()
  {
    this.timeout(20000)
    it("getRandomSentence() should return one sentence", () =>
    {
      const repo = new sentenceRepository.SentenceRepository()
      return repo.getRandomSentence("人").then(sentence =>
      {
        assert.strictEqual(sentence.char, "人")
        assert.ok("freq" in sentence)
        assert.ok("jpn" in sentence)
        assert.ok("eng" in sentence)
      }).finally(() =>
      {
        repo.dispose()
      })
    })
    it("getRandomSentence() returns null when no sentence found", () =>
    {
      const repo = new sentenceRepository.SentenceRepository()
      return repo.getRandomSentence("non-existing character")
        .then(sentence =>
        {
          assert.ok(sentence === null)
        })
        .finally(() =>
        {
          repo.dispose()
        })
    })
    it("getAllSentences() should return more than one sentence", () =>
    {
      const repo = new sentenceRepository.SentenceRepository()
      return repo.getAllSentences("人")
        .then(sentences =>
        {
          assert.ok(sentences.length > 1);
          assert.strictEqual(sentences[0].char, "人")
          assert.ok("freq" in sentences[0])
          assert.ok("jpn" in sentences[0])
          assert.ok("eng" in sentences[0])
        })
        .finally(() =>
        {
          repo.dispose()
        })
    })
    it("getFullListOfRandomSentences()", () =>
    {
      const repo = new sentenceRepository.SentenceRepository()
      return repo.getFullListOfRandomSentences()
        .then(list =>
        {
          assert.ok(list.length > 1)
          assert.strictEqual(list.filter(s => s.char == "人").length, 1)
        })
        .finally(() =>
        {
          repo.dispose()
        })
    })
  })
})