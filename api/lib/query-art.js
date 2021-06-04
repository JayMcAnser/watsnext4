/**
 * query the art definition
 * @type {QueryBuilder}
 */
const Const = require('../lib/const');
const QueryBuilder = require('./query-builder');

class QueryArt extends QueryBuilder {

  constructor(props) {
    super({
      fields:{
        'default': ['%title', '%searchcode'],
        searchCode: ['searchcode'],
      },
      sorts: {
        default: ['title'],
        searchCode: ['searchcode'],
        year: ['yearFrom', 'title'],
        yearDesc: ['-yearFrom']
      }
    });
  }


}
module.exports = QueryArt
