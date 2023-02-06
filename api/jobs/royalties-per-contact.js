/**
 * calculate the royalties over as specific period
 *
 * version 1.0.0 @jay 2022-12-14
 */


const RoyaltiesContact = require('../reports/royalties-contact').RoyaltiesContact
const RoyaltiesContract = require('../reports/royalties-contact').RoyaltiesContract
const DbMySQL = require("../lib/db-mysql");
const DbMongo = require("../lib/db-mongo");
const Moment = require('moment');

const _optionsToReq = (options)  => {
  if (options.debug) { debug(`importing ${options.file ? options.file : 'Speadsheet.xlsx'}`) }
  let req = {
    query: {
      year: Moment().year()
    }
  }
  if (options.hasOwnProperty('year')) {
    req.query.year = options.year
  }
  if (options.hasOwnProperty('quarter')) {
    req.query.quarter = options.quarter
  }
  if (options.hasOwnProperty('recalc')) {
    req.query.recalc = 1
  }
  if (options.hasOwnProperty('id')) {
    req.query.id = options.id
  }
  if (options.hasOwnProperty('mongo')) {
    req.query.mongoQueryFilename = options.mongo
  }
  if (options.hasOwnProperty('royaltyType')) {
    req.query.royaltyType = options.royaltyType
  }

  return req;
}

const jobRoyaltyContact = async (options= {}) => {
  await init();

  let report = new RoyaltiesContact();
  return await report.execute(_optionsToReq(options))
  // return true;
}

const jobRoyaltyContract = async(options = {} ) => {
  await init();

  let report = new RoyaltiesContract();
  return await report.execute(_optionsToReq(options))
}

const debug = (msg) => {
  console.log(msg)
}

async function init() {
  try {
    await DbMySQL.connect();
    await DbMongo.connect();
  } catch (e) {
    console.log(`[Error] starting db connection: ${e.message}`)
    throw e
  }
}

module.exports = {
  jobRoyaltyContact,
  jobRoyaltyContract
}
