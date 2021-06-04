const app = require('../index');
const chai = require('chai');
const assert = chai.assert;

const QueryArt = require('../lib/query-art');
const ArtModel = require('../model/art');


describe('query-art', () => {
  const recordCount = 30;
  const SEARCH_CODE_PRE = 'QBART-';
  let session = false;

  before( async() => {
    session = await require('./init-test').Session;

    for (let index = 0; index < recordCount; index++) {
      let searchCode = SEARCH_CODE_PRE + ('' + (index + 1)).padStart(2, '0')
      let art = await ArtModel.findOne({searchcode: searchCode});
      if (!art) {
        let title = searchCode;
        if (index < 6) {
          title += ' work'
        }
        if (index < 3) {
          title += ' again'
        }
        art = await ArtModel.create(session, {searchcode: searchCode, title})
      }
    }
  })
  after( async() => {
    for (let index = 0; index < recordCount; index++) {
      let searchCode = SEARCH_CODE_PRE + ('' + (index + 1)).padStart(2, '0')
      await ArtModel.deleteOne({searchcode: searchCode})
    }
  })

  it('find single', async () => {
    let qryArt = new QueryArt();
    let def = qryArt.parse({query:{
        query: SEARCH_CODE_PRE + '01'
      }});
    let rec = await ArtModel.find(def.filter);
    assert.equal(rec.length, 1)
  })
})
