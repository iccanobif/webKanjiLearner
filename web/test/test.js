const assert = require("assert")
const edict = require("../edict.js")
const ut = require("../utils.js")

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
    it("should get more than one definition for ambiguous pronouciations", () =>
    {
      let definitions = edict.getDefinitions("かんじょう")
      assert.ok(definitions.length > 1)
      assert.ok(definitions.filter((x) => x.keys.includes("感情")).length = 1)
      assert.ok(definitions.filter((x) => x.keys.includes("勘定")).length = 1)
    })
  })
})
