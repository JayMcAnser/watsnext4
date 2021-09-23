/**
 * Test the Art model
 */
const InitTest = require('./init-test');
let  DbMongo;

const chai = require('chai');
const assert = chai.assert;
const Bookmark = require('../model/bookmark');
const Setup = require('../lib/setup');



describe('model.bookmark', () => {
  let bookmark;

  let session;

  before(async () => {
    await InitTest.init();
    DbMongo = await InitTest.DbMongo;
    session = await InitTest.Session;

    await Bookmark.deleteMany({})
    await Setup.runSetup(session)
  });

  it('create', async () => {
    bookmark = await Bookmark.queryOne(session, {bookmarktId: 1});
    if (!bookmark) {
      bookmark = Bookmark.create(session, {bookmarkId: 1, name: 'book 1'});
      await bookmark.save();
      bookmark = await Bookmark.queryOne(session, {bookmarkId: 1});
    }
    assert.equal(bookmark.bookmarkId, 1);
    assert.equal(bookmark.name, 'book 1');
  });


  describe('exended', async () => {
    let bookmark = await Bookmark.create(session, {bookmarkId: 2, name: 'book 2'});

    it('set values', async () => {
      bookmark.isMediakunst = true;
      await bookmark.save();

      let bookmark2 = await Bookmark.findOne({bookmarkId: 2});
      assert.isTrue(bookmark2 !== null);
      assert.isDefined(bookmark2.isMediakunst);
      assert.isTrue(bookmark2.isMediakunst)

      bookmark2.isMediakunst = false;
      await bookmark2.save();

      bookmark2 = await Bookmark.findOne({bookmarkId: 2});
      assert.isTrue(bookmark2 !== null);
      assert.isDefined(bookmark2.isMediakunst);
      assert.isFalse(bookmark2.isMediakunst)
    })
  })

});
