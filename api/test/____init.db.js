/**
 * init the Mongo driver
 */
const envInit = require('./init');
const DbMongo = require('../lib/db-mongo');
const DbMySQL = require('../lib/db-mysql');

async function init() {
  try {
    await DbMySQL.connect();
    await DbMongo.connect();
  } catch (e) {
    console.error(`error starting db connection: ${e.message}`)
    throw e
  }

}

module.exports = {
  init,
  DbMongo,
  DbMySQL
}
