/**
 * query the art definition
 * @type {QueryBuilder}
 */
const Const = require('../lib/const');
const QueryBuilder = require('./query-builder');

class QueryArt extends QueryBuilder {

  constructor(props) {
    super({table: 'art', fields:['title']});
  }


}
module.exports = QueryArt
