/**
 * A flex distribution model where the field can be define on-the-fly
 *
 */
const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const Logging = require('../vendors/lib/logging');
const UndoHelper = require('mongoose-undo');
const ModelHelper = require('./model-helper');
const Art = require('./art');
const Carrier = require('./carrier');
const User = require('./user');
const LoggingServer = require('../lib/logging-server').loggingServer;
const _ = require('lodash');
const Util = require('../lib/util');
const Config = require('../lib/default-values');
const Moment = require('moment')

//
// const RoyaltieSchema  = Mongoose.Schema( {
// //  contactPercentage: Number,
//   agentPercentage: Number,
// //  artPercentage: Number,
// //   contact:  {
// //     type: Schema.Types.ObjectId,
// //     ref: 'Contact'
// //   },
//   agent:  {
//     type: Schema.Types.ObjectId,
//     ref: 'Agent'
//   },
//   art:  {
//     type: Schema.Types.ObjectId,
//     ref: 'Art'
//   }
// })
//
// RoyaltieSchema.virtual('amount').get(function() {
//   const price = this.parent().price;
//   return price * (this.contactPercentage / 100) * (this.agentPercentage / 100);  // * (this.artPercentage / 100)
// })

const LineSchema = {
  order: {type: String},     // the order of the lines
  price: {type: Number},     // price in cents
  quality: {type: String},  // requested quality if art is given
  art: {
    type: Schema.ObjectId,
    ref: 'Art'
  },
  carrier: {
    type: Schema.ObjectId,
    ref: 'Carrier'
  },
  // agent will be filled in during recalculation. This is the creator
  agent: {
    type: Schema.ObjectId,
    ref: 'Agent'
  },
  royaltyPercentage: {type: Number},
  royaltyAmount: {type: Number},
  royaltyErrors:  [
    ModelHelper.ErrorMessageSchema
  ]
};

const LockLayout = {
  isLocked: {type: Boolean},
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  date: {type: Date, default: Date.now}
}

const DistributionExtendLayout = {
  locationId: { type: String}, // the locationId of the DistributionLayout
  exactInvoice: {type: String},
  noRoyalty: {type: Boolean},  // if set to true this contract does not include royalties
  hasRoyaltyErrors: {type: Boolean, default: false},

  eventEndDate: {type: Date},   // should not have the time part for quering
  eventStartDateVal: {type: String}, // the eventStartDate with only the date part for comparing / range select / sorting

  isLocked: {type: Boolean, default: false},    // if true the royalties are never recalculated
  lockHistory: [LockLayout],     // history of locking and unlocking
}
const DistributionLayout = Object.assign({
  locationId: String,
  code: { type: String },
  invoiceNumber: {type: String},
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  contactName: {type: String},
  invoice: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  invoiceName: {type: String},
  mail: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  insertion: {type: String},
  event: {type: String},
  header: {type: String},
  footer: {type: String},
  eventStartDate: {type: Date}, // should not have the time part for quering

  comments: {type: String},
  vat: {type: Number},
  productionCosts: {type: Number},
  shippingCosts: {type: Number},
  otherCosts: {type: Number},
  otherCostsText: {type: String},
  // for the undo definition
  created: UndoHelper.createSchema,
  lines: [LineSchema],
}, DistributionExtendLayout);

let DistributionSchema = new Schema(DistributionLayout);
ModelHelper.upgradeBuilder('DistributionExtra', DistributionSchema, DistributionExtendLayout)

DistributionSchema.plugin(UndoHelper.plugin);


DistributionSchema.virtual('subTotalCosts')
  .get( function() {
    let result = 0;
    if (this.lines && this.lines.length) {
      for (let l = 0; l < this.lines.length; l++) {
        if (this.lines[l].price) {
          result += this.lines[l].price
        }
      }
    }
    return result;
});

DistributionSchema.virtual('totalCosts')
  .get( function() {
    let result = this.subTotalCosts;
    if (this.productionCosts) {
      result += this.productionCosts
    }
    if (this.shippingCosts) {
      result += this.shippingCosts
    }
    if (this.otherCosts) {
      result += this.otherCosts
    }
    return result;
  });

// /**
//  * check if there is an error in the royaties
//  */
// DistributionSchema.virtual('hasRoyaltyErrors')
//   .get( function() {
//     if (this.lines && this.lines.length) {
//       for (let l = 0; l < this.lines.length; l++) {
//         if (this.lines[l].royaltyErrors.length) {
//           return true;
//         }
//       }
//     }
//     return false;
//   });
DistributionSchema.virtual('royaltyErrors')
  .get( function() {
    let result = [];
    if (this.lines && this.lines.length) {
      for (let l = 0; l < this.lines.length; l++) {
        if (this.lines[l].royaltyErrors.length) {
          result.push(...this.lines[l].royaltyErrors)
        }
      }
    }
    return result;
  });


/**
 * fill in the default contacts if none is given
 */
DistributionSchema.pre('save', async function() {
  if (this.eventStartDate) {
    this.eventStartDate = Moment.utc(this.eventStartDate).startOf('date');
  }
  if (this.eventEndDate) {
    this.eventEndDate = Moment.utc(this.eventEndDate).startOf('date');
  }
  this.eventStartDateVal = Moment.utc(this.eventStartDate).startOf('date').format('YYYYMMDD');


  if (this.contact && ! this.invoice) {
    this.invoice = this.contact;
  }
  if (this.contact && ! this.mail) {
    this.mail = this.contact;
  }
  if (this.lines.length) {
    for (let index = 0; index < this.lines.length; index++) {
      if (this.lines[index].carrier && !this.lines[index].art) {
        // auto include the art if the carrier is give and no art is defined
        let carrier = await Carrier.findById(this.lines[index].carrier);
        if (carrier) {
          if (carrier.artwork.length === 1) {
            this.lines[index].art = carrier.artwork[0].art;
          } else {
            this.art = undefined;
            LoggingServer.warn('distribution.save', `distribution: ${this._id}: carrier ${carrier._id} has multiple artworks. Only first one is processed`);
          }

        } else if (!this.lines[index].art) {
          LoggingServer.error('distribution.save', `distribution: ${this._id}: art && carrier does not exist`);
        }
      }
    }
  }
})



DistributionSchema.methods.session = function(session) {
  this.__user = session.name;
  this.__reason = session.reason;
}

/**
 *
 * @param itemData Art or Carrier or {art:, [field]: ...} or { carrier: , [fields]}
 */
DistributionSchema.methods.lineAdd = function(itemData) {
  let itm = _.cloneDeep(itemData)
  if (itemData.art || itemData.carrier) {
    // and object with art or carrier
    if (itemData.art) {
      itm.art = itemData.art._id === undefined ? itemData.art : itemData.art._id;
    } else if (itemData.carrier) {
      itm.carrier = itemData.carrier._id === undefined ? itemData.carrier : itemData.carrier._id;
    }
//    FlexModel.objectSet(itm, LineFieldMap, itemData);
  } else {
    // direct art or carrier
    let model = itemData.constructor.modelName;
    if (!model || ['Carrer', 'Art'].indexOf(model) < 0) {
      Logging.log('warn', `distribution: unknown line type: ${model}`);
      return;
    }
    itm = {};  // must reset because type is of the relation
    itm[model.toLowerCase()] = itemData._id;
  }
  this.lines.push(itm);
};

DistributionSchema.methods.lineUpdate = function(index, itemData) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.lines.length; ind++) {
      if (index.toString() === this.lines[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.lines.length) {
    Object.assign(this.lines[ind], itemData);
    this.markModified('lines');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};

DistributionSchema.methods.lineRemove = function(index) {
  let ind = index;
  if (typeof index !== 'number') {
    for (ind = 0; ind < this.lines.length; ind++) {
      if (index.toString() === this.lines[ind].toString()) {
        break;
      }
    }
  }
  if (ind < this.lines.length) {
    this.lines.splice(ind, 1);
    this.markModified('lines');
  } else {
    throw new ErrorTypes.ErrorNotFound('line not found');
  }
};

DistributionSchema.methods.lineCount = function() {
  return this.lines.length;
};

/**
 * lock the distribution record an remembers who did it
 * @param session
 * @return {Promise<void>}
 */
DistributionSchema.methods.lockRoyalties = async function(session) {
  if (!this.isLocked) {
    this.lockHistory.push({
      isLocked: true,
      user: session.user
    });
    this.isLocked = true;
    await this.save();
  }
  return this;
}

DistributionSchema.methods.unlockRoyalties = async function(session) {
  if (this.isLocked) {
    this.lockHistory.push({
      isLocked: false,
      user: session.user
    });
    this.isLocked = false;
    await this.save();
  }
  return this;
}
DistributionSchema.virtual('canRoyaltyCalc')
  .get( function() {
    return !this.isLocked;
  });


/**
 * calculate all information for the royalties calculation
 * the calculation are store in a per line structure.
 * Errors are stored in royaltiesErrors
 *
 * information should be saved afterwards
 */
DistributionSchema.methods.royaltiesCalc = async function() {
  if (this.isLocked) {
    return this;
  }

  for (let indexLine = 0; indexLine < this.lines.length; indexLine++) {
    let line = this.lines[indexLine];
    line.royaltyAmount = 0;
    line.royaltyPercentage = 0;
    line.royaltyErrors = [];
    line.agent = null;
    if (!this.noRoyalty) {
      if (line.price > 0) {
        let art = await Art.findById(line.art).populate({
          path: 'agents.agent'  // to get the creator
        });
        if (art) {
          // the percentage is
          let valid = art.royaltiesValidate()
          if (valid.length > 0) {
            line.royaltyErrors.push({type: 'error.art', message: valid.join('\n'), data: valid, index: indexLine})
            continue; // can not compute this line
          }
          let agent = art.creator; // agents[indexAgent].agent;
          if (!agent) {
            line.royaltyErrors.push({type: 'error.agent', message: 'primary artist not found', index: indexAgent})
          } else {
            if (agent.agentId === -1) {
              line.royaltyErrors.push({type: 'error.art', message: 'there is no primary artist'})
              continue;
            }
            let valid = agent.royaltiesValidate();
            if (valid.length > 0) {
              line.royaltyErrors.push({type: 'error.agent', message: valid.join('\n'), data: valid})
              continue; // don't do anything else
            }
            // the percentage is defined in by the agent, but can be overruled by the artwork
            let percAgent = agent.percentage === undefined ? Config.value('royalties.agent.percentage', 60): agent.percentage;
            if (percAgent > 0) {
              line.agent = agent;
              line.royaltyPercentage = percAgent;
              line.royaltyAmount = line.price * (percAgent / 100);
            }
          }
          //}
        } else {
          console.warn('art not found')
          line.royaltyErrors.push({type: 'error', message: 'art not found', index: indexLine})
        }
      }
    }
  }
  this.hasRoyaltyErrors = this.lines.findIndex( (l) => l.royaltyErrors.length > 0) >= 0
  return this;
}


// DistributionSchema.static('findRoyaltiesMatch', function(options = {}) {
//   let qry = {$and: []};
//   if (options.startDate) {
//     // qry.$and.push({$eventStartDate: {$gte: {$dateFromString: {dateString: Moment(options.startDate).startOf('day').toISOString()}}}});
//     qry.$and.push({
//         '$gte':
//           {
//             '$eventStartDate': {
//               $dateFromString: {dateString: Moment(options.startDate).startOf('day').toISOString()}
//             }
//           }
//       }
//     )
//   }
//   if (options.endDate) {
//     qry.$and.push({eventStartDate: {$lte: Moment(options.endDate).startOf('day').format()}});
//   }
//   if (options.hasOwnProperty('shouldProcess')) {
//     if (options.shouldProcess) {
//       qry.$and.push({$or: [{isLocked: false}, {isLocked: {$exists: false}}]})
//     } else {
//       qry.$and.push({isLocked: true});
//     }
//   }
//   if (qry.$and.length === 0) {
//     delete qry.$and;
//   }
//   return {$match: qry}
// })

DistributionSchema.static('findRoyaltiesMatch', function(options = {}) {
  let expr = {$and: []};
  if (options.startDate) {
    expr.$and.push(
      {
        $gte: ['$eventStartDateVal', options.startDate]
      }
    )
  }
  if (options.endDate) {
    //-- is eventStart date because it's the only date that counts
    expr.$and.push(
      {
        $lte: ['$eventStartDateVal', options.endDate]
      }
    )
  }
  if (options.hasOwnProperty('shouldProcess')) {
    if (options.shouldProcess) {
      //qry.$and.push({$or: [{isLocked: false}, {isLocked: {$exists: false}}]})
      // expr.$and.push({$or: [{$eq: [{isLocked: false}, {isLocked: {$gt: null}}]}]})
      expr.$and.push({$eq: ['$isLocked', false]})
    } else {
      // qry.$and.push({isLocked: true});
      expr.$and.push({$eq: ['$isLocked', true]})
    }
  }

  if (expr.$and.length === 0) {
    return {$match: {}}
  } else {
    return {$match: {$expr: expr}}
  }
})

/**
 * retrieve the distribution records,
 * options -
 *   - startDate: first date that is included (default: all)
 *   - endDate: last date the is included (default: today)
 *   - shouldProcess: the royalties should still be process, or where already processed
 *
 * @return the MongoDb query
 */
DistributionSchema.static('findRoyalties', function(options = {}) {
  let aggr = this.findRoyaltiesMatch(options);
  return this.aggregate([aggr])
})

module.exports = Mongoose.Model('Distribution', DistributionSchema);
