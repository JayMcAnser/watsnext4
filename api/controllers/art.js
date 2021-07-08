
const ApiReturn = require('../vendors/lib/api-return');
const ArtModel = require('../model/art');
const QueryArt = require('../lib/query/query-art');


module.exports = {
  /**
   * query the interface
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  list: async function (req, res) {
    try {
      if (req.session.canRead('art')) {
        let qry = new QueryArt(res.query);
        // let recs = await ArtModel.aggregate(qry.aggregate(req))
        // return ApiReturn.result(req, res, recs, 200);
        return ApiReturn.result(req, res, (await qry.data(ArtModel, req)), 200)
      }
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },

  /**
   * request an art by it's id
   */
  id: async function(req, res) {
    try {
      if (req.session.canRead('art')) {
        let qry = new QueryArt(res.query);
        // let recs = await ArtModel.aggregate(qry.aggregate(req))
        // return ApiReturn.result(req, res, recs, 200);
        return ApiReturn.result(req, res, await qry.byId(ArtModel, req), 200)
      }
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },

  /**
   * request an art by it's id
   */
  patch: async function(req, res) {
    try {
      if (req.session.canWrite('art')) {
        let qry = new QueryArt(res.query);
        // let recs = await ArtModel.aggregate(qry.aggregate(req))
        // return ApiReturn.result(req, res, recs, 200);
        return ApiReturn.result(req, res, await qry.update(ArtModel, req), 200)
      }
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },

}
