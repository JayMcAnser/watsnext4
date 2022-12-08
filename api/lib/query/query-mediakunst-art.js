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
  postProcessFilter(filter, query) {
  //   let partFilter = {isMediakunst: true}

    if (filter.length) {
      let index = filter.findIndex((x) => x.hasOwnProperty('$match'))
      if (index >= 0) {
        filter[index].$match = {
          $and: [
            {isMediakunst: true},
            filter[index].$match
          ]
        }
      } else {
        filter.push({ $match : {isMediakunst: true}})
      }
    } else {
      filter.push({ $match : {isMediakunst: true}})
    }
    return super.postProcessFilter(filter, query)
  }
}

module.exports = QueryMediakunstArt
