
const ApiReturn = require('../vendors/lib/api-return');
const RoyaltyModel = require('../model/distribution');
const QueryRoyalties = require('../lib/query/query-royalty');
const Distribution = require('../model/distribution')
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

  recalc: async function(req, res) {
    if (req.session.canWrite('royalties')) {
      Logging.log('info', 'query royalties', 'ctrl.royalties.recalc')
      let errorCount = 0;
      let result = [];
      let qry = new QueryRoyalties(res.query);
      let data = await qry.data(RoyaltyModel, req)
      for (let index = 0; index < data.length; index++) {
        let roy = await Distribution.findById(data[index]._id);
        if (!roy) {
          Logging.log('error', `missing distribution.id: ${data[index]._id}`, 'ctrl.royalty.recalc')
          result.push({status: 'missing', id: data[index]._id.toString()})
        } else {
          await roy.royaltiesCalc();
          await roy.save();
          if (roy.hasRoyaltyErrors) {
            result.push({status: 'error', id: data[index]._id.toString(), errors: roy.royaltyErrors})
          } else {
            result.push({status: 'ok', id: data[index]._id.toString()})
          }
        }
      }
      return ApiReturn.result(req, res, {count: data.length, recIds: result}, 200);
    } else {
      Logging.log('warn', 'access denied: royalty', 'ctrl.royalty.recalc')
      ApiReturn.result(req, res, 'access denied', 403)
    }
  },

  artists: async function (req, res) {
    if (req.session.canRead('royalties')) {
      return ApiReturn.result(req, res, 'royalties are active', 200);
    } else {
      Logging.log('warn', 'access denied: royalty', 'ctrl.royalty.artists')
      ApiReturn.result(req, res, 'access denied', 403)
    }
  },

  errors: async function(req, res) {
    if (req.session.canRead('royalties')) {
      Logging.log('info', 'error', 'ctrl.royalties.errors')
      let result = [];
      let qry = new QueryRoyalties(res.query);
      let data = await qry.royaltyErrors(RoyaltyModel, req)
      return ApiReturn.result(req, res, data, 200);
    } else {
      Logging.log('warn', 'access denied: royalty', 'ctrl.royalty.artists')
      ApiReturn.result(req, res, 'access denied', 403)
    }
  },

}
