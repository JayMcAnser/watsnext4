

const ArtModel = require('../../model/art')
const recordCount = 30;
// const SEARCH_CODE_PRE = 'QBART-';

const mockAdd = async function(key) {
  let session = await require('../init-test').Session;

  for (let index = 0; index < recordCount; index++) {
    let searchCode = key + ('' + (index + 1)).padStart(2, '0')
    let art = await ArtModel.findOne({searchcode: searchCode});
    if (!art) {
      let title = searchCode;
      if (index < 6) {
        title += ' workXX'
      }
      if (index < 3) {
        title += ' againXX'
      }
      art = await ArtModel.create(session, {searchcode: searchCode, title});
      await art.save()
    }
  }
}

const mockRemove = async function (key) {
  for (let index = 0; index < recordCount; index++) {
    let searchCode = key + ('' + (index + 1)).padStart(2, '0')
    await ArtModel.deleteOne({searchcode: searchCode})
  }
}


module.exports.recordCount = recordCount;
// module.exports.SEARCH_CODE_PRE = SEARCH_CODE_PRE;
module.exports.mockAdd = mockAdd;
module.exports.mockRemove = mockRemove;
