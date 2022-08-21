const ApiReturn = require('../vendors/lib/api-return');
const Const = require('../lib/const')
const DbMongo = require('../lib/db-mongo');
const Logging = require("../vendors/lib/logging");
const QueryArt = require("../lib/query/query-art");
const ArtModel = require("../model/art");
const Jwt = require("jsonwebtoken");
const Config = require("config");


module.exports = {
  /**
   * query the interface
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  info: async function (req, res) {
    try {
      let data = {
        status: 'api running normal',
        version: require('../package.json').version
      }
      return ApiReturn.result(req, res, data, 200)
    } catch (e) {
      ApiReturn.error(req, res, e, 200)
    }
  },

}
