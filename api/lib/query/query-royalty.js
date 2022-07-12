/**
 * query the royalties definition
 * @type {QueryBuilder}
 */
const Const = require('../const');
const QueryBuilder = require('../query-builder');
const Distribution = require('../../model/distribution');
const Moment = require("moment");


class QueryRoyalty extends QueryBuilder {
  constructor(props) {
    super({
      fields:{
        'default': {
          fields: ['%event', '%eventStartDate'],
          caption: 'Events'
        },
        searchCode: {
          fields: ['searchcode'],
          caption: 'search code'
        },
      },
      sorts: {
        default: ['event'],
        'date': ['eventStartDate'],
        'event': ['event'],
        'event.rev': ['-event'],
      },
      views: {
        title: {id: 1, event:1, eventStartDate: 1}
      },
      model: 'distribution'
    });
  }


  /**
   * build the selector from the request and returns the $match part
   *
   * @param req
   * @return {*}
   * @private
   */
  _partialMatch(req) {
    let config = {};
    config.startDate = req.query.start;
    if (config.startDate) {
      config.startDate = Moment(config.startDate)
    }
    config.endDate = req.query.end;
    if (config.endDate) {
      config.endDate = Moment(config.endDate)
    }
    if (req.query.process) {
      config.shouldProcess = !!req.query.process
    }

    return Distribution.findRoyaltiesMatch(config);
  }
  async data(model, req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    return Distribution.aggregate(a);
  }

  async artists(model, req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    // do the grouping on artist

  }
}

module.exports = QueryRoyalty;
