/**
 * changes the type of royalty contract for an artist
 *
 */

const DbMongo = require("../lib/db-mongo");
const Moment = require("moment/moment");
const Artist = require('../model/agent')


const _optionsToReq = (options)  => {
  let req = {query: {}}
  if (options.debug) { debug(`importing ${options.file ? options.file : 'Speadsheet.xlsx'}`) }
  if (options.hasOwnProperty('id')) {
    req.query.artist = options.id
  }
  if (options.hasOwnProperty('type')) {
    req.query.type = options.type
  }

  return req;
}
async function init() {
  try {
    await DbMongo.connect();
  } catch (e) {
    console.log(`[Error] starting db connection: ${e.message}`)
    throw e
  }
}

const jobRoyaltyType = async (options= {}) => {
  await init();
  let req = _optionsToReq(options);

  let artists = await Artist.find({agentId: String(req.query.artist)})
  if (!artists.length) {
    console.log(`artist ${req.query.artist} was not found`)
    return;
  }
  let artist = artists[0]
  let type = Number(req.query.type) % 3;
  artist.royaltiesPeriod = type;
  await artist.save();
  return `change ${artist.name} to type: ${artist.royaltiesPeriod} (${['Yearly','Quarterly', 'Monthly'][artist.royaltiesPeriod % 3]})`
}

module.exports = {
  jobRoyaltyType
}
