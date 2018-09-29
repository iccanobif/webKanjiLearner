const assert = require("assert")
const edict = require("../common/edict.js")
const ut = require("../common/utils.js")
const sentenceSplitter = require("../common/sentenceSplitter.js")

describe("utils", function ()
{
  describe("#uniq()", () =>
  {
    it("should work lol", () => {
      assert.deepStrictEqual([1,2,3], [2,2,1,3].uniq())
    })
  })
})

describe('edict', function ()
{
  this.timeout(10000)
  before((done) =>
  {
    edict.addLoadedCallback(done)
  })
  describe('#isJapaneseWord()', () =>
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
    it("should conjugate ぬ (negative) verb forms too", () => {
      assert.ok(edict.isJapaneseWord("知らぬ"))
      assert.ok(edict.isJapaneseWord("出来ぬ"))
      assert.ok(edict.isJapaneseWord("食べぬ"))
    })
    it("Conjugate verbs to their 未然形 form too, so that something like 言わなければならない at least gets the 言わ part clickable and pointing to 言う", () =>
    {
      assert.ok(edict.isJapaneseWord("言わ"))
    })
  })
  describe("#getDefinition()", () =>
  {
    it("should get the definitions of unconjugated words", () =>
    {
      let definitions = edict.getDefinitions("食べる")
      assert.equal(definitions.length, 1)
      assert.ok(definitions[0].keys.includes("食べる"))
    })
    it("should get the definitions of conjugated words", () =>
    {
      let definitions = edict.getDefinitions("泳いだ")
      assert.equal(definitions.length, 1)
      assert.ok(definitions[0].keys.includes("泳ぐ"))
    })
    it("should get more than one definition for ambiguous pronounciations", () =>
    {
      let definitions = edict.getDefinitions("かんじょう")
      assert.ok(definitions.length > 1)
      assert.ok(definitions.filter((x) => x.keys.includes("感情")).length = 1)
      assert.ok(definitions.filter((x) => x.keys.includes("勘定")).length = 1)
    })
    it("should return an empty array when asked for a word that's not in the dictionary", () =>
    {
      assert.deepStrictEqual([], edict.getDefinitions("this is not a word"))
    })
    it("the definition objects have both a 'keys' property with all possible conjugations and a 'dictionaryForms' one with only the base forms", () =>
    {
      let definitions = edict.getDefinitions("食べる")
      assert.ok(definitions[0].keys.includes("食べた"))
      assert.ok(definitions[0].dictionaryForms.includes("食べる"))
      assert.ok(!definitions[0].dictionaryForms.includes("食べた"))
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
// Stuff that's currently not split properly:
// 経験する
})


