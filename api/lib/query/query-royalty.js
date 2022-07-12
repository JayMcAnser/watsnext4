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
      },
      views: {
        title: {id: 1, event:1, eventStartDate: 1}
      },
      model: 'distribution'
    });
  }

  async data(model, req) {
    let partialQuery = this.aggregate(req.query)
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
    let a = this.aggregate(req.query);
    let match = Distribution.findRoyaltiesMatch(config);
    a.push(match);
    let recs = await Distribution .aggregate(a);
    return recs;

  }
}

module.exports = QueryRoyalty;
