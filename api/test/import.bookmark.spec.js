

const InitTest = require('./init-test');
let DbMySql;
let  DbMongo;
const Session = require('../lib/session');
const chai = require('chai');
const assert = chai.assert;
const ImportBookmark = require('../import/bookmark-import');
const Bookmark = require('../model/bookmark');
const Setup = require('../lib/setup');

describe('import bookmark', function()  {
  this.timeout(60000);

  let session;

  before(async () => {
    await InitTest.init();
    DbMySql = await InitTest.DbMySQL;
    DbMongo = await InitTest.DbMongo;
    session = await InitTest.Session;// new Session('test-import-agent')

    await Bookmark.deleteMany({})
    await DbMySql.connect()
    await Setup.runSetup(session)
  });

  it('field data', () => {
    let imp = new ImportBookmark({session});
    let record = {
      "bookmark_ID": 1,
      "user_ID": 1,
      "type_ID": 2,
      "is_global": "1",
      "is_temp": "0",
      "name": "test bookmark",
    };
    return imp.runOnData(record).then((mRec) => {
      assert.equal(mRec.bookmarkId, 1);
      assert.equal(mRec.type, 'art');
      assert.equal(mRec.user, '1');
      assert.equal(mRec.type, 'art');
      assert.equal(mRec.isGlobal, true);
      assert.equal(mRec.isTemp, false);
      assert.equal(mRec.name, 'test bookmark');

      // add a second test record
      record.bookmark_ID = 2
      record.name = 'title 2';
      return imp.runOnData(record).then((mRec) => {
        assert.equal(mRec.name, 'title 2');
      });
    })
  });

  // -- ok but takes to long
  // it('run - clean', () => {
  //   const limit = 2;
  //   let imp = new ImportBookmark({ session, limit: limit});
  //   return imp.run(DbMySql).then( (result) => {
  //     assert.equal(result.count, limit)
  //   })
  // });

  it ('import mediakunst', async() => {
    const MEDIAKUNST = 2423;
    let imp = new ImportBookmark({ session, limit: 1});
    let sql = `SELECT * from bookmarks WHERE bookmark_ID = ${MEDIAKUNST}`;
    let qry = await DbMySql.query(sql);
    assert.equal(qry.length, 1)
    await imp.runOnData(qry[0]);
    let rec = await Bookmark.findOne({bookmarkId: MEDIAKUNST});
    assert.isTrue(rec !== null);
    assert.isTrue(Object.keys(rec).length > 0);
    assert.isTrue(rec.items.length > 0);

    let mediakunst = await Bookmark().Mediakunst();
    assert.isDefined(mediakunst);
    assert.equal(mediakunst._id.toString(), rec._id.toString())
  })
})
