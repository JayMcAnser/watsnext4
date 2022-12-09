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
   * runs the recalulate and returns an array of distribution with an error
   *
   * @param req
   * @param options
   * @return {Promise<array of distribution with an error>}
   */
  async distributionErrors(req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));

    let recs = await Distribution.aggregate(a);
    for (let index = 0; index < recs.length; index++) {
      let roy = await Distribution.findById(recs[index]._id);
      // there should be an easy way to call the calc function, but can not find it. So retrieve the record again
      roy = await roy.royaltiesCalc();
      await roy.save();
    }
    // -- list for errors
    return await Distribution.find({"lines.royaltyErrors": {$exists: true, $not: {$size: 0}}})
  }

  /**
   * build the selector from the request and returns the $match part
   *
   * @param req
   *   - startDate = first date that should be included, format: YYYYMMDD
   *   - endDate = last date that should be included, format: YYYYMMDD
   *   - year = year to run on. Overrules startDate and endDate
   *   - quarter = the quarter to use. overrules startDate and endDate with the year. If omitted it uses the entire year
   *               (0 .. 3)
   *   - process = isLocked state (true or false) if omitted anything goes   *
   * @return {*}
   * @private
   */
  _partialMatch(req) {
    let config = {};
    config.startDate = req.query.start;
    config.endDate = req.query.end;
    if (req.query.process) {
      config.shouldProcess = !!req.query.process
    }
    if (req.query.year) {
      const year = req.query.year;
      if (req.query.hasOwnProperty('quarter')) {
        const quarter = req.query.quarter;
        config.startDate = Moment.utc(year + '-01-01').add(quarter, 'Q').format('YYYYMMDD');
        config.endDate = Moment.utc(year + '-01-01').add(quarter + 1, 'Q').subtract(1, 'd').format('YYYYMMDD');
      } else {
        config.startDate = year + '0101';
        config.endDate =  Moment.utc(year + '-01-01').add(1, 'y').subtract(1, 'd').format('YYYYMMDD');
      }
    }

    return Distribution.findRoyaltiesMatch(config);
  }

  /**
   * raw selects the distribution contracts in a period
   *
   * @param model Should be Distribution, but isn't used because it's always the same
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
   * recalculate the selected record to set the agent information in the lines
   *
   * @param a Object the mongo select statement
   * @return {Promise<list of distribution with errors>}
   * @private
   */
  async _recalcSelectedRecords(a) {
    let recs = await Distribution.aggregate(a);
    for (let index = 0; index < recs.length; index++) {
      let roy = await Distribution.findById(recs[index]._id);
      // there should be an easy way to call the calc function, but can not find it. So retrieve the record again
      roy = await roy.royaltiesCalc();
      await roy.save();
    }
  }

  /**
   * list the lines that have royalties in the period given
   *
   * @param model   *
   * @param req  { query }
   *    query: Object
   *       - standard parameters (startDate, etc)
   *       - recalc: Boolean if set the selected ranges is recalculated so agent and errors in the lines are set
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async royaltyLines(model, req) {
    // the page, limit, etc part
    let a = this.aggregate(req.query);
    // the filter definition
    a.push(this._partialMatch(req));

    if (req.query.hasOwnProperty('recalc') && req.query.recalc) {
      await this._recalcSelectedRecords(a)
    }
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
    if (req.query.hasOwnProperty('recalc') && req.query.recalc) {
      await this._recalcSelectedRecords(a)
    }
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
    if (req.query.hasOwnProperty('recalc') && req.query.recalc) {
      await this._recalcSelectedRecords(a)
    }
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

  /**
   * @param options
   *     - royaltyType: false | 0 | 1 the type of schema. False means all
   * @return {[{$unwind: string},{$addFields: {royaltyAmount: string, agent: string, art: string, price: string, royaltyPercentage: string, royaltyErrors: string}},{$unset: string},{$lookup: {localField: string, as: string, foreignField: string, from: string}},{$addFields: {agentInfo: {$arrayElemAt: (string|number)[]}}},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}
   * @private
   */

  _convertDistr2AddressLines(options = {royaltyType: false}) {
    let result = [
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
          "from": "agents",
          "localField": "agent",
          "foreignField": "_id",
          "as": "agentData"
        }},
      {$addFields: {"agentInfo": {$arrayElemAt: ["$agentData",0]}}},
      {$unset: 'agentData'},

      {$lookup: {
          "from": "arts",
          "localField": "art",
          "foreignField": "_id",
          "as": "artData"
        }},
      {$addFields: {"artInfo": {$arrayElemAt: ["$artData",0]}}},
// add the period to the artwork for later selecting
      {$addFields: {"artInfo.royaltiesPeriod": "$agentInfo.royaltiesPeriod"}},
      {$unset: 'artData'},

// -- load the contact

      {$unwind: "$agentInfo.contacts"},
      {$addFields: {
          contact: "$agentInfo.contacts"
        }},
      {$lookup: {
          "from": "contacts",
          "localField": "contact.contact",
          "foreignField": "_id",
          "as": "contactData"
        }},
      {$addFields: {
          "contactInfo": {$arrayElemAt: ["$contactData",0]}
        }},
// -- need artist info in the contact
      {$unset: "contactData"},
      {$addFields: {
          "contactInfo.percentage": "$contact.percentage",
          "contactInfo.royaltiesPeriod": "$agentInfo.royaltiesPeriod",
        }},
      {$unset: "contact"},
// -- sort on event order
      {$sort: {"eventStartDate": 1}}];

// ----------------------------------------------------------------------------------
// -- the filter for the matching
      if (options.royaltyType !== false) {
        result.push({$match: {"artInfo.royaltiesPeriod": options.royaltyType}})
      }

// ----------------------------------------------------------------------------------
      result.push(
// -- group on the contact
      {$group: {
          _id: "$contactInfo._id",
          total: {$sum: '$royaltyAmount'},
          events: {$push: "$$ROOT"},
          contacts: {$push: "$contactInfo"},
      }},
// -- set the contact to the base level
      {$addFields: {
          contact: {$arrayElemAt: ["$contacts",0]}}
      },
      {$unset: 'contacts'},
// -- sort it so it reproducable
      {$sort: {'contact.name': 1}},
    )
    return result;
  }

  /**
   *
   * @param req Object the request object
   *    query: {
   *      [standart of date, etc]
   *      [standard of limit, page, etc]
   *      royaltyType: integer  (0 = year, 1 = quarter, missing = all)
   *    }
   * @param options
   *    - returnData boolean default true
   * @return {Promise<Aggregate<Array<any>>>}
   */
  async contactEvents(req, options = {}) {
    let a = [];
    // -- build the select statement for the distribution contracts that are there
    a.push(this._partialMatch(req));
    // -- check if we need to load the agents / artworks
    if (req.query.hasOwnProperty('recalc') && req.query.recalc) {
      let errors = await this._recalcSelectedRecords(a);
    }

    let royaltyType = req.query.hasOwnProperty('royaltyType') ? req.query.royaltyType % 2: false
    a = a.concat(this._convertDistr2AddressLines({royaltyType}))

    if (options.hasOwnProperty('returnData') && ! options.returnData ) {
      return a;
    }
    return Distribution.aggregate(a);
  }
}

module.exports = QueryRoyalty;
