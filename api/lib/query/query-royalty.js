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

  /**
   * raw selects the distribution contracts in a period
   *
   * @param model
   * @param req
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async data(model, req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    return Distribution.aggregate(a);
  }

  /**
   * include the artist info into a distribution aggregate
   * @private
   */
  _royaltyLines() {
    return [
        {$unwind: '$lines'},
        {$addFields: {
            'agent': '$lines.agent',
            'art': '$lines.art',
            'price': '$lines.price',
            'royaltyAmount': '$lines.royaltyAmount',
            'royaltyPercentage': '$lines.royaltyPercentage',
            'royaltyErrors': '$lines.royaltiesErrors'
          }
        },
        {$unset: 'lines'},
        {$lookup: {
            from: "agents",
            localField: "agent",
            foreignField: "_id",
            as: "agent"
          }},
        {$unwind: '$agent'},  // add the agent to every line

        {$lookup: {
            from: "arts",
            localField: "art",
            foreignField: "_id",
            as: "art"
          }},
        {$unwind: '$art'}    ]
  }

  /**
   * list the lines that have royalties in the period given
   *
   * @param model
   * @param req
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async royaltyLines(model, req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    // do the grouping on artist
    a = a.concat(this._royaltyLines());
    return Distribution.aggregate(a);
  }

  _groupArtist() {
    return [
      {
        $group: {
          _id: '$agent._id',
          // _id: '$agent.name',
          lineCount: {'$sum': 1 },
          total: {$sum:1 }
        }
      }
    ]
  }

  /**
   * list the lines that have royalties in the period given
   *
   * @param model
   * @param req
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async artists(model, req, options = {}) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    // do the grouping on artist
    a = a.concat(this._royaltyLines(), this._groupArtist());
    if (!a.find((step) => step.hasOwnProperty('$sort')) && options.sort) {
      a = a.concat(options.sort)
    }
    return Distribution.aggregate(a);
  }


}

module.exports = QueryRoyalty;
