/**
 * calculate the royalties over as specific period
 *
 * version 1.0.0 @jay 2022-12-14
 */


const RoyaltiesContact = require('../reports/royalties-contact')
const DbMySQL = require("../lib/db-mysql");
const DbMongo = require("../lib/db-mongo");

const jobRoyaltyContact = async (options= {}) => {
  await init();

  if (options.debug) { debug(`importing ${options.file ? options.file : 'Speadsheet.xlsx'}`) }
  let req = {
    query: {
      year: 2022
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
  let report = new RoyaltiesContact();
  await report.execute(req)
  return true;
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
  jobRoyaltyContact
}
