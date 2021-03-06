const InitTest = require('./init-test')
const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const QueryArt = require('../lib/query/query-art');
const ArtModel = require('../model/art');
const ArtMock = require('./data/art.mock')

describe('query-art', () => {
  const recordCount = ArtMock.recordCount
  const SEARCH_CODE_PRE = 'QBMORE-'
  let session = false;

  before( async() => {
    session = await InitTest.Session;
    await ArtMock.mockAdd(SEARCH_CODE_PRE)
  })

  after( async() => {
    await ArtMock.mockRemove(SEARCH_CODE_PRE)
  })

  describe('find', () => {
    it('find single, exact', async () => {
      let qryArt = new QueryArt();
      let def = qryArt.parse({query:{
          query: SEARCH_CODE_PRE + '10',
          field: 'searchCode'
        }});
      let rec = await ArtModel.find(def.filter);
      assert.equal(rec.length, 1);
      assert.equal(rec[0].searchcode, SEARCH_CODE_PRE + '10')
    });

    it ('find multiple, contain', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.parse({query:{
          query: 'workXX'
        }});
      let rec = await ArtModel.find(def.filter);
      assert.equal(rec.length, 6);
    })

    it ('find multiple, contain, multi values', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.parse({query:{
          query: 'againXX workXX'
        }});
      let rec = await ArtModel.find(def.filter);
      assert.equal(rec.length, 3);
    })
  });

  describe('count of record in a query', () => {
    it ('find multiple, list count', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.parseCount({query:{
          query: 'againXX workXX'
        }});
      let count = await ArtModel.countDocuments(def.filter);
      assert.equal(count, 3);
    })
  })
  describe('order', () => {
    it ('sort on one statement', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.parse({query:{
          query: 'workXX'
        }});
      let rec = await ArtModel.find(def.filter).sort(def.sort);
      assert.equal(rec.length, 6);
    })

    it('aggregration', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: 'workXX'
        });
      let rec = await ArtModel.aggregate(def)
      assert.equal(rec.length, 6);

    })
  });

  describe('paging', () => {
    it('number of items, page = 0', async () =>  {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: SEARCH_CODE_PRE,
          page: 0
        });
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, qryArt.itemPerPage);
    });

    it('number of items, page = 1', async () =>  {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: SEARCH_CODE_PRE,
          page: 1
        });
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, recordCount -  qryArt.itemPerPage);
    });

    it('number of items, page = not found', async () =>  {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: SEARCH_CODE_PRE,
          page: 10
        });
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, 0);
    })
  });

  describe('view', () => {
    it ('basic', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: 'workXX'
        });
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, 6);
      let r = rec[0];
      assert.isDefined(r._id);
      assert.isDefined(r.title);
      assert.isDefined(r.searchcode);
    })

    it ('extended', async() => {
      let qryArt = new QueryArt();
      let def = qryArt.aggregate({
          query: 'workXX',
          view: 'title'
        });
      let rec = await ArtModel.aggregate(def);
      assert.equal(rec.length, 6);
      let r = rec[0];
      assert.isDefined(r._id);
      assert.isDefined(r.title);
      assert.isDefined(r.searchcode);
      assert.isUndefined(r.royaltiesPercentage, 'field is not in view')
    })

  });
})
