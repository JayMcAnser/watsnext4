/**
 * query the mediakunsts art definition
 * @type {QueryBuilder}
 */
const Const = require('../const');
const QueryArt = require('./query-art');

class QueryMediakunstArt extends QueryArt {

  constructor(props) {
    super(props);
    this.defaultLimit = 100;
  }

  /**
   * to overlad the $match filter for all requests
   *
   * @param filter Object the $or statement
   * @return {*}
   */
  buildFilter(filter) {
    let partFilter = {isMediakunst: true}
    if (Object.keys(filter).length ) {
      partFilter = {
        $and: [
          { isMediakunst: true },
          filter
        ]
      };
    }
    return partFilter
  }
}

module.exports = QueryMediakunstArt
