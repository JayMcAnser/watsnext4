const InitTest = require('./init-test')
// const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const QueryMediakunstArt = require('../lib/query/query-mediakunst-art');
const ArtModel = require('../model/art');
// const ArtMock = require('./data/art.mock')

describe('query-mediakunst-art', () => {
  // const recordCount = ArtMock.recordCount
  // const SEARCH_CODE_PRE = ArtMock.SEARCH_CODE_PRE
  let session = false;

  before( async() => {
    session = await InitTest.Session;
//    await ArtMock.mockAdd()
  })

  // after( async() => {
  //   await ArtMock.mockRemove()
  // })

  describe('find', () => {
    it('list all', async () => {
      let qryMediakunstArt = new QueryMediakunstArt();
      let req = {};
      let def = qryMediakunstArt.aggregate(req);
      assert.isDefined(Array.isArray(def));
      assert.equal(def.length, 1, 'only the $match');
      assert.isDefined(def[0].$match)
      assert.isTrue(def[0].$match.isMediakunst)

      def.push({$sort: {artId: 1}});
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, 5);
      assert.isDefined(rec[0].artId)
      assert.equal(rec[0].artId, '4')
    });

    it('by title - splitted', async () => {
      let qryMediakunstArt = new QueryMediakunstArt();
      let req = {
        "query": 'Garden'
      };
      let def = qryMediakunstArt.aggregate(req);
      assert.isDefined(Array.isArray(def));
      assert.equal(def.length, 1);
      assert.isDefined(def[0].$match)

      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, 1);
      assert.isDefined(rec[0].artId)
      assert.equal(rec[0].artId, '7', 'can change if other data is loaded')
    })

    it('by title - direct', async () => {
      let qryMediakunstArt = new QueryMediakunstArt();
      let req = {
        query: {
          query: 'Garden'
        }
      };

      let rec = await qryMediakunstArt.data(ArtModel, req);
      assert.equal(rec.length, 1);
      assert.isDefined(rec[0].artId)
      assert.equal(rec[0].artId, '7', 'can change if ohter data is loaded')
    })
  })
})
