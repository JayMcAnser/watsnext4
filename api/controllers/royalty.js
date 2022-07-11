
const ApiReturn = require('../vendors/lib/api-return');
const RoyaltyModel = require('../model/distribution');
const QueryRoyalties = require('../lib/query/query-royalty');
const Logging = require('../vendors/lib/logging')


module.exports = {
  /**
   * query the interface
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  list: async function (req, res) {
    try {
      if (req.session.canRead('royalties')) {
        Logging.log('info', 'query royalties', 'ctrl.royalties.list')
        let qry = new QueryRoyalties(res.query);
        let data = await qry.data(RoyaltyModel, req)
        Logging.log('info', `result ${data.length} records`, 'ctrl.royalty.list')
        return ApiReturn.result(req, res, data, 200)
      }
      Logging.log('warn', 'access denied: royalty', 'ctrl.royalty.list')
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },
  info: async function (req, res) {
    if (req.session.canRead('royalties')) {
      return ApiReturn.result(req, res, 'royalties are active', 200);
    } else {
      Logging.log('warn', 'access denied: royalty', 'ctrl.royalty.info')
      ApiReturn.result(req, res, 'access denied', 403)
    }
  },
}
