/**
 * Test the Mediakunst fake model
 */
const InitTest = require('./init-test');
let  DbMongo;

const chai = require('chai');
const assert = chai.assert;
const Config = require('config');
const Mediakunst = require('../model/mediakunst');
const Art = require('../model/art');
const Agent = require('../model/agent');
const Bookmark = require('../model/bookmark');
const BookmarkImport = require('../import/bookmark-import');
const Setup = require('../lib/setup');

const MEDIAKUNST_ID = (Config.has('Mediakunst.id') ? Config.get('Mediakunst.id') : 2423).toString()

describe('model.mediakunst', function ()  {
  this.timeout(40000)
  let session;

  before(async () => {
    await InitTest.init();
    DbMongo = await InitTest.DbMongo;
    session = await InitTest.Session;
    await Setup.runSetup(session)

    // we must delete the art works so the artist will get imported
    let bookmarkArtsWorks = await Bookmark.aggregate(
      [
        {
          $match: {bookmarkId: MEDIAKUNST_ID}
        },
        {$lookup: {
            from: "arts",
            localField: "items.art",
            foreignField: "_id",
            as: "artWork"
          }
        },
        {$unwind: "$artWork"}
      ]
    )
    for (let index = 0; index < bookmarkArtsWorks.length; index++) {
      await Art.deleteOne({_id: bookmarkArtsWorks[index].artWork._id})
    }
    await Bookmark.deleteOne({bookmarkId: MEDIAKUNST_ID});

    let imp = new BookmarkImport({session});
    await imp.runOnId(MEDIAKUNST_ID, { limit: 5})
  });

  it ('has a bookmark' , async() => {
    let bookmark = await Bookmark().Mediakunst();
    assert.isTrue((bookmark !== null));
    assert.isTrue(bookmark.items.length > 0)
  });

  it('reset the artwork to the new bookmark', async() => {
    let result = await Mediakunst.importData();
    assert.equal(result.errors.artCnt, 1, 'one is missing');
    assert.equal(result.errors.artistCnt, 0)
  })

  it('adding/removing an art', async() => {
    let bookmark = await Bookmark().Mediakunst();
    let art = await Art.findById(bookmark.items[0].art);
    assert.isTrue(art !== null);
    assert.isTrue(art.isMediakunst)
    art.isMediakunst = false;
    await art.save();

    let result = await Mediakunst.importData();
    assert.equal(result.errors.artCnt, 1, 'still missing the art')
    assert.equal(result.errors.artistCnt, 0)
    assert.equal(result.added.artCnt, 1)

    bookmark.items.pull({_id: bookmark.items[0]._id.toString()});
    await bookmark.save();
    result = await Mediakunst.importData();
    assert.equal(result.errors.artCnt, 1, 'still missing')
    assert.equal(result.errors.artistCnt, 0)
    assert.equal(result.removed.artCnt, 1)
  })
});
