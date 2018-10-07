const assert = require("assert")
const edict = require("../common/edict.js")
const ut = require("../common/utils.js")
const sentenceSplitter = require("../common/sentenceSplitter.js")
const kanjidic = require("../common/kanjidic.js")

describe("utils", function ()
{
  describe("uniq()", () =>
  {
    it("should work lol", () =>
    {
      assert.deepStrictEqual([1, 2, 3], [2, 2, 1, 3].uniq())
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
  })
  describe("getDefinition()", () =>
  {
    it("should get the definitions of unconjugated words", () =>
    {
      let definitions = edict.getDefinitions("食べる")
      assert.equal(definitions.length, 1)
      assert.ok(definitions[0].kanjiElements.includes("食べる"))
    })
    describe("should return an object with the following properties (that are used elsewhere in the program):", () =>
    {
      it("kanjiElements", () => { assert.ok("kanjiElements" in edict.getDefinitions("食べる")[0]) })
      it("readingElements", () => { assert.ok("readingElements" in edict.getDefinitions("食べる")[0]) })
      it("glosses", () => { assert.ok("glosses" in edict.getDefinitions("食べる")[0]) })
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
  })
  describe("getBaseForms", () =>
  {
    it("should get the base form of a conjugated verb (kanji)", () =>
    {
      assert.deepStrictEqual(["食べる"], edict.getBaseForms("食べられる"))
      assert.deepStrictEqual(["食べる"], edict.getBaseForms("食べた"))
    })
    it("should get the base form of a conjugated verb (kana)", () =>
    {
      assert.deepStrictEqual(["たべる"], edict.getBaseForms("たべられる"))
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
      let readings = edict.getReadings(word)
      assert.equal(readings.length, 1)
      assert.equal(readings[0], reading)
    }
    it("should convert uninflected kanji words to kana correctly", () =>
    {
      checkKanjiWithOnlyOnePossibleReading("食べる", "たべる")
    })
    // it("should convert inflected kanji words to kana correctly", () =>
    // {
    //   checkKanjiWithOnlyOnePossibleReading("食べた", "たべた")
    // })
    // it("should use re_restr to map each reading to the correct kanji form", () =>
    // {
    //   checkKanjiWithOnlyOnePossibleReading("この上なく", "このうえなく")
    // })
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
  // Stuff that's currently not split properly:
  // 経験する
  // 大きな蜘蛛が部屋にいるの！早く退治してちょうだい！ (should be に/いる instead of にい/る)
  // その男は頑としてその職にしがみつき、決して退職しようとはしなかった。
  // 証人が事実を隠せば刑法の罪に問われる。
  // 彼女の行動はしだいに攻撃的になってくるだろう。
})