const ApiReturn = require('../vendors/lib/api-return');
const MediakustModel = require('../model/mediakunst');
const ArtModel = require('../model/art');
const QueryMediakunstArt = require('../lib/query/query-mediakunst-art')
const Logging = require('../vendors/lib/logging')


module.exports = {
  /**
   * query the interface
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  info: async function (req, res) {
    try {
      if (req.session.canRead('mediakunst')) {
        Logging.log('info', 'mediakunst.info', 'ctrl.mediakunst.info')
        let data = await MediakustModel.stats();
        return ApiReturn.result(req, res, data, 200)
      }
      Logging.log('warn', 'access denied: mediakunst', 'ctrl.mediakunst.info')
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },

  listArt: async function(req, res) {
    try {
      if (req.session.canRead('mediakunst')) {
        Logging.log('info', 'mediakunst.listArt', 'ctrl.mediakunst.listArt')
        let qry = new QueryMediakunstArt()
        let data = await qry.data(ArtModel, req)
        Logging.log('info', `result ${data.length} records`, 'ctrl.mediakunst.listArt')
        return ApiReturn.result(req, res, data, 200)

      }
      Logging.log('warn', 'access denied: mediakunst', 'ctrl.mediakunst.info')
      ApiReturn.result(req, res, 'access denied', 403)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  }
};
