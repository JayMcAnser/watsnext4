
const ApiReturn = require('../vendors/lib/api-return');
const ArtModel = require('../model/art');
const QueryArt = require('../lib/query-art');


module.exports = {
  list: async function (req, res) {
    try {
      if (req.session.canRead('art')) {
        let qry = new QueryArt(res.query);
        // let recs = await ArtModel.aggregate(qry.aggregate(req))
        // return ApiReturn.result(req, res, recs, 200);
        return ApiReturn.result(req, res, await qry.data(ArtModel, req))
      }
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  }
}
