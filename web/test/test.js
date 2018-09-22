const assert = require("assert")
const edict = require("../edict.js")

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
  })
})
