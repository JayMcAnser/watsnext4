/**
 * class that converts a query to find command for the mongodb
 *
 * version 0.1 _jay_ 2021-06-02
 */
const Logging = require('../vendors/lib/logging')
const Const = require('../lib/const');

class QueryBuilder {

  constructor(options = {}) {
    this._fields = options.fields;
    this._table = options.table;
    if (!this._table || !this._fields) {
      Logging.logThrow('fields and table are required', 'querybuild.constructor')
    }
  }

  /**
   * convert the params to a query usable for mongo
   * @param params Array fieldname=
   */
  toQuery(params) {
    if (params === undefined || typeof params !== 'object') {
      Logging.logThrow(Const.errors.missingParamaters)
    }
    // should do all the checking
    Logging.log('debug', 'missing param checking')
    return params;
  }


}

module.exports = QueryBuilder;
