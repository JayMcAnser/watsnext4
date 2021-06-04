
const ApiReturn = require('../vendors/lib/api-return');
const ArtModel = require('../model/art');
const QueryArt = require('../lib/query-art');

const _validate = function(req) {
  return true
}

module.exports = {
  list: async function (req, res) {
    let art;
    try {
      _validate(req)
      if (req.query) {
        let qry = new QueryArt(res.query);
        if (qry) {
          art = ArtModel.find()
        }
      }
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }

    ApiReturn.error(req, res, 'not implemented', 404)
    // try {
    //   let boardId = await boardModel.newId(_getSession(req))
    //   ApiReturn.result(req, res, boardId, `[controller.board].newId`)
    // } catch (e) {
    //   ApiReturn.error(req, res, e, 200)
    // }
  }
}
