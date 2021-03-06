/**
 * query the art definition
 * @type {QueryBuilder}
 */
const Const = require('../const');
const QueryBuilder = require('../query-builder');

class QueryArt extends QueryBuilder {

  constructor(props) {
    super({
      fields:{
        'default': {
          fields: ['%title', '%searchcode'],
          caption: 'title and search code'
        },
        searchCode: {
          fields: ['searchcode'],
          caption: 'search code'
        },
      },
      sorts: {
        default: ['title'],
        searchCode: ['searchcode'],
        year: ['yearFrom', 'title'],
        yearDesc: ['-yearFrom']
      },
      views: {
        title: {id: 1, title:1, description: 1, searchcode: 1}
      },
      model: 'art'
    });
  }


}
module.exports = QueryArt
