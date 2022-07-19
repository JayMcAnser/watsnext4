/**
 * query the royalties definition
 * @type {QueryBuilder}
 */
const Const = require('../const');
const QueryBuilder = require('../query-builder');
const Distribution = require('../../model/distribution');
const Moment = require("moment");
const ErrorInfo = require('../../lib/logging-server').ErrorInfo


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
          totalAmount: {"$sum": '$royaltyAmount' }
        }
      },
      {$lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agent"
        }},
      {$unwind: '$agent'},
      {$sort: {'agent.name': 1}}
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


  _royaltyErrors() {
    return [
      {$match:
          {$expr:
              {$eq: ['$hasRoyaltyErrors', true]}
          }
      }
    ]
  }

  /**
   * list the royalty errors in the range
   *
   * @param model
   * @param req the request
   * @param options Object
   *     - sort Object a list of fields to sort on, default on locationId
   *
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async royaltyErrors(model, req, options = {}) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));
    // list the errors with a fixed sort
    a = a.concat(this._royaltyErrors(),[{$sort: options.hasOwnProperty('sort') ? options.sort : {'locationId': 1}}]);
    return Distribution.aggregate(a);
  }


  _filterArtistById = (id) => {
    return [
      {$unwind: "$lines"},
      {$match:   {$expr: {'$eq' : [ "$lines.agent" , {$toObjectId: `${id}`}] }}}      ,
      // {$group: { _id: "$_id"}},
      // {$lookup: {
      //     from: "distributions",
      //     localField: "_id",
      //     foreignField: "_id",
      //     as: "event"
      //   }},
      // {$unwind: "$event"},
      {$lookup: {
          "from": "arts",
          "localField": "lines.art",
          "foreignField": "_id",
          "as": "lines.artWork"
        }},
      {
        "$unwind": "$lines.artWork"
      },
      {$lookup: {
          "from": "agents",
          "localField": "lines.agent",
          "foreignField": "_id",
          "as": "lines.agentData"
        }},
      {
        "$unwind": "$lines.agentData"
      },

      {$group: {
          "_id": "$_id",
          "lines":{"$addToSet": "$lines"}
        }},
      {$lookup: {
          from: "distributions" ,
          localField: "_id",
          foreignField: "_id",
          as: "event"
        }},
      {$unwind: "$event"},
      {$sort: {"event.eventStartDate": 1, "event.event": 1}}, // event date has not time !!!
      {$project: {
          "eventTitle": "$event.event",
          "eventStartDate": "$event.eventStartDate",
          "artist": "$lines.agentData",
          "lines": "$lines",
          "event": "$event",
        }},
      {$unwind: "$artist"},
      {$unset: "lines.agentData"},
// -- get the contact information
      {$lookup: {
          "from": "contacts",
          "localField": "artist.contacts",
          "foreignField": "_id",
          "as": "contacts"
        }},
      {$unwind: "$artist.contacts"}

    ];
    // this should be done in the end:
    // {$project: {$filter: {
    //   input: 'lines',
    //     cond: {"$eq": [
    //     "$lines.agent",
    //     {
    //       "$toObjectId": "62d3e4d57a9435c83bd43fb3"
    //     }]}
    //
    // }}   })
  }
  /**
   * the full royalty report of one artist with in range
   *
   * @param model
   * @param req   needs id param
   * @return {Promise<void>}
   *   {agent: {agentInfo}, events: [eventInfo, [artworkInfo]]}
   *
   *
   */
  async artistEvents(model, req) {
    if (!req.query.hasOwnProperty('id')) {
      throw new ErrorInfo('missing id')
    }
    let a = this.aggregate(req.query);
    // filter so we only have the once in this range
    a.push(this._partialMatch(req));
    // filter the artist out of it
    a = a.concat(this._filterArtistById(req.query.id))
    return Distribution.aggregate(a);
  }
}

module.exports = QueryRoyalty;
