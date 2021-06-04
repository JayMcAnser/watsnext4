/**
 * class that converts a query to find command for the mongodb
 *
 * version 0.1 _jay_ 2021-06-02
 */
const Logging = require('../vendors/lib/logging')
const Const = require('../lib/const');
const ITEMS_PER_PAGE = 20;

class FieldDef {
  constructor(options = {fieldName: ''}) {
    this.fieldName = options.fieldName.trim();
    if (!this.fieldName.length) {
      Logging.logThrow(`fieldName is missing`)
    }
    switch (this.fieldName[0]) {
      case '%':
        this.compare = 'contain';
        this.fieldName = this.fieldName.substr(1)
        break;
      case '=':
        this.compare = 'equal';
        this.fieldName = this.fieldName.substr(1)
        break;
      default:
        this.compare = options.hasOwnProperty('compare') ? options.compare : 'equal';
    }
    this.caseSensitive = options.hasOwnProperty('caseSensitive') ? options.caseSensitive : false;
  }

  makeCompare(value) {
    let result = {}
    switch (this.compare) {
      case 'equal':
        result[this.fieldName] = value;
        break;
      case 'contain' :
        result[this.fieldName] = { $regex: value}
        if (this.caseSensitive === false) {
          result[this.fieldName]['$options']= 'i'
        }
        break;
      default:
        Logging.log('warn', `unknown field compare ${this.compare}`, 'QueryBuild.makeCompare')
        return false;
    }
    return result;
  }
}

class QueryBuilder {

  /**
   * options.field Object: fieldnames || Array: [{fieldName, compare}]
   * @param options
   */
  constructor(options = {}) {
    this._searchFields = this._processFields(options.fields);
    this._table = options.table;
    this._sortField = options.sortFields;
    if (!this._table || !this._searchFields) {
      Logging.logThrow('fields and table are required', 'querybuild.constructor')
    }
  }

  /**
   *
   * @param fields
   *  if string: the field name
   *  if object: field definition
   *
   * @return {undefined | Object with fieldNames and search definition}
   * @private
   */
  _processFields(fields) {
    if (fields === undefined) { return undefined}
    let result = {};  //
    if (Array.isArray(fields)) {
      for (let index = 0; index < fields.length; index++) {
        if (typeof fields[index] === 'string') {
          result[fields[index]] = new FieldDef({fieldName: fields[index]})
        } else if (typeof fields[index] === 'object' && fields[index].fieldName) {
          result[fields[index].fieldName] = new FieldDef(fields[index])
        } else {
          Logging.logThrow(`field nr ${index} can only be string or an object with property fieldName`)
        }
      }
    } else if (typeof fields === 'string') {
      result[fields] =  new FieldDef({fieldName: fields});
    } else if (typeof fields === 'object') {
      for (let fieldName in fields ) {
        result[fieldName] = new FieldDef(fields[fieldname])
      }
    }
    return result;
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

  /**
   * convert the sort string into the mongoDb sort string
   * see: https://stackoverflow.com/questions/4299991/how-to-sort-in-mongoose
   * @param sort String,
   * @return Boolean | Object
   */
  _sortStatement(sort) {
    let sortFields = sort.split('&').map((f) => f.trim());
    let result = {}
    for (let index = 0; index < sortFields.length; index++) {
      let fieldName = sortFields[index]
      if (sortFields[index][0] === '-' || sortFields[index][0] === '+') {
        fieldName = fieldName.substr(1)
      }
      if (this._sortField[fieldName]) {
        if (sortFields[index][0] === '-') {
          result[fieldName] = 1
        } else {
          result[fieldName] = -1
        }
      } else {
        Logging.log('warn', `[query.sort]: unknown field ${fieldName} in table ${this._table}`)
      }
    }
    return Object.keys(result).length ? result : false;
  }

  /**
   * build the query and returns the object
   * query runs a contains, not a direct definition
   * use where if exact values are needed
   *
   * @param query String fieldname=value&fielname=value
   * @return false | Object
   */
  _queryStatement(query, fields) {
    let values = query.split(' ').map((f) => f.trim());
    let result = {};
    // we will query all the fields that are defined in the _searchFields if no other fields are give
    if (fields === undefined) {
      fields = this._searchFields
    }
    for (let fieldName in fields) {
      if (!fields.hasOwnProperty(fieldName)) { continue }
      let andPart = []
      for (let index = 0; index < values.length; index++) {
        let fieldCmp = fields[fieldName].makeCompare(values[index]);
        if (fieldCmp) {
          andPart.push(fieldCmp)
        }
      }
      if (andPart.length) {
        if (andPart.length === 1) { // remove the and if only one value
          andPart = andPart[0]
        } else {
          andPart = {'$and': andPart}
        }
        if (!result.hasOwnProperty('$or')) {
          result['$or'] = [andPart]
        } else {
          result['$or'].push(andPart);
        }
      }
    }
    if (!result.hasOwnProperty(['$or'])) {
      return false;
    } else if(result['$or'].length === 1) {
      return result['$or'][0]
    } else {
      return result;
    }
  }

  /**
   * convert the req to that params / limit / pages etc
   * @param req
   *   req.params:
   */
  parse(req) {
    let result = {
      skip: false,
      limit: false,
      sort: false,
      query: false,
    }
    if (req.query) {
      // build the query limiter
      let itemsPerPage = ITEMS_PER_PAGE;
      let page = 0;
      if (req.query.items && Number.isInteger(req.query.items)) {
        itemsPerPage = req.params.items;
      }
      if (req.query.page && Number.isInteger(Number.parseInt(req.query.page))) {
        page = req.query.page
      } else if (req.query.p && Number.isInteger(Number.parseInt(req.query.p))) {
        page = req.query.p
      }
      if (page) {
        result.skip = itemsPerPage * page;
        result.limit = itemsPerPage;
      }

      // -- create the sorting
      if (req.query.sort) {
        result.sort = this._sortStatement(req.query.sort)
      }
      // create the where
      if (req.query.query) {
        result.filter = this._queryStatement(req.query.query)
      }
    }
    return result;
  }
}

module.exports = QueryBuilder;
module.exports.itemsPerPage = ITEMS_PER_PAGE;
