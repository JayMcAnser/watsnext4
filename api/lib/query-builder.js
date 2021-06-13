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
   * options.fields Object | Array
   *   Array: the list of field to compare with. Will become the default search
   *   Object: the names of the filters to use. If default is not included, the first one will be set as default
   * options.sortOrders Object
   *   per sortName the definition of the fields. -[fieldname] makes it descending
   *
   * options.view Object
   *   the views to limit the fields return
   *
   */
  constructor(options = {}) {
    // the filters are the definition of the fields to search in.
    this._filters = {}
    this._itemPerPage = ITEMS_PER_PAGE;
    this._processFields(options.fields);
    this._processSort(options.sortOrders);
    this._processViews(options.views);
    if (Object.keys(this._filters).length === 0) {
      Logging.logThrow('fields is required', 'querybuild.constructor')
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

    if (Array.isArray(fields)) {
      let result = {};  //
      for (let index = 0; index < fields.length; index++) {
        if (typeof fields[index] === 'string') {
          result[fields[index]] = new FieldDef({fieldName: fields[index]})
        } else if (typeof fields[index] === 'object' && fields[index].fieldName) {
          result[fields[index].fieldName] = new FieldDef(fields[index])
        } else {
          Logging.logThrow(`field nr ${index} can only be string or an object with property fieldName`)
        }
      }
      this._filters['default'] = result;
    // } else if (typeof fields === 'string') {
    //   result[fields] =  new FieldDef({fieldName: fields});
    } else if (typeof fields === 'object') {
      // the multiple search definitions
      for (let filter in fields) {
        if (!fields.hasOwnProperty(filter)) { continue }
        if (typeof fields[filter] === 'string') {
          Logging.log('warn', 'field type string not yet implemented')
        } else {
          let result = {}
          for (let index = 0; index < fields[filter].length; index++) {
            let f = new FieldDef({fieldName: fields[filter][index]})
            result[f.fieldName] = f;
          }
          this._filters[filter] = result;
        }
      }
      if (!this._filters.hasOwnProperty('default') && Object.keys(this._filters) > 0) {
        this._filters['default'] = this._filters[Object.keys(this._filters)[0]]
      }
    }
  }

  /**
   * process the different named sort definitions
   * @param fields
   * @private
   */
  _processSort(fields) {
    this._sorts = {}
    if (fields !== undefined) {
      for (let sortName in fields) {
        if (!fields.hasOwnProperty(sortName)) { continue }
        let result = []
        for (let index = 0; index < fields[sortName].length; index++) {
          let fieldName = fields[sortName][index].trim();
          if (fieldName.length === 0) {
            Logging.log('warn', `empty field name in sort ${sortName}`)
            break
          }
          result.push(fieldName);
        }
        if (result.length) {
          this._sorts[sortName] = result
        } else {
          Logging.log('warn', `empty sort statement ${sortName} removed`)
        }
      }
      if (Object.keys(this._sorts).length && !this._sorts.hasOwnProperty('default')) {
        this._sorts['default'] = this._sorts[Object.keys(this._sorts)[0]]
      }
    }
    if (Object.keys(this._sorts).length === 0) {
      this._sorts = {'default': ['id']}
    }
  }

  /**
   * convert the views to the $project statements
   * for format see: https://docs.mongodb.com/manual/reference/operator/aggregation/project/
   * @param views
   * @private
   */
  _processViews(views) {
    this._views = {};
    for (let view in views) {
      if (!views.hasOwnProperty(view)) { continue }
      this._views[view] = views[view];
    }
    if (Object.keys(this._views).length === 0) {
      this._views.default = {id: 1}
    } else if (!this._views.default) {
      // make the first one the default
      this._views.default = this._views[Object.keys(this._views)[0]]
    }
  }

  get filterNames() {
    return Object.keys(this._filters)
  }
  get sortNames() {
    return Object.keys(this._sorts)
  }
  get viewNames() {
    return Object.keys(this._views)
  }

  get itemPerPage() {
    return this._itemPerPage
  }
  set itemsPerPage(value) {
    this._itemPerPage = value
  }

  /**
   * convert the sort string into the mongoDb sort string
   * see: https://stackoverflow.com/questions/4299991/how-to-sort-in-mongoose
   * @param sortName String,
   * @return Boolean | Object
   */
  _sortStatement(sortName) {
    let sort = this._sorts[sortName];
    if (sort === undefined) {
      Logging.log('warn', `unknown sort name ${sortName}`);
      sort = this._sorts['default']
    }
    let result = {}
    for (let index = 0; index < sort.length; index++) {
      let fieldName = sort[index]
      if (fieldName[0] === '-' || fieldName[0] === '+') {
        fieldName = fieldName.substr(1).trim();
      }
      if (sort[index][0] === '-') {
        result[fieldName] = -1
      } else {
        result[fieldName] = 1
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
   * @param fields String the field definition to use
   * @return false | Object
   */
  _queryStatement(query, fields) {
    let values = query.split(' ').map((f) => f.trim());
    let result = {};
    // we will query all the fields that are defined in the _searchFields if no other fields are give
    if (!fields === undefined) {
      fields = this._filters['default']
    } else if (this._filters.hasOwnProperty([fields])) {
      fields = this._filters[fields]
    } else {
      Logging.log('warn', `unknown search field (${fields}). using default`);
      fields = this._filters['default']
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
   * @param req Object with query
   *    - items - Number number of items to retrieve
   *    - page - Number the page to retrieve
   *    - sort - String a name sorting definition
   *    - query - String the ' ' separate list of values
   *    - filter - String the named filter fields. default: 'default'
   */
  parse(req) {
    let result = {
      skip: false,
      limit: false,
      sort: req.query.hasOwnProperty('sort') ? req.query.sort : 'default',
      query: false,
      fields: req.query.hasOwnProperty('fields')? req.query.fields : 'default',
      view: req.query.hasOwnProperty('view')? req.query.view : 'default'
    }
    if (req.query) {
      // build the query limiter
      let itemsPerPage = this.itemPerPage;
      let page = 0;
      if (req.query.items && Number.isInteger(req.query.items)) {
        itemsPerPage = req.params.items;
      }
      if (req.query.hasOwnProperty('page') && Number.isInteger(Number.parseInt(req.query.page))) {
        page = req.query.page
        result.skip = itemsPerPage * page;
        result.limit = itemsPerPage;
      }
      result.sort = this._sortStatement(result.sort)
      // create the where
      if (req.query.query) {
        result.filter = this._queryStatement(req.query.query, result.fields)
      }
      result.fields = this._views[result.view]
    }

    return result;
  }

  aggregate(req) {
    let query = this.parse(req);
    let result = [{$match: query.filter}, {$sort: query.sort}];
    if (query.limit) {
      if (query.skip) {
        result.push({$skip: query.skip})
      }
      result.push({$limit: query.limit})
    }
    result.push({ $project: this._views[query.view]})
    return result
  }

  /**
   * return the data that is assioated with the call
   * @param model
   * @param req
   */
  async data(model, req) {
    let a = this.aggregate(req);
    return await model.aggregate(a)
  }
}

module.exports = QueryBuilder;
module.exports.itemsPerPage = ITEMS_PER_PAGE;
