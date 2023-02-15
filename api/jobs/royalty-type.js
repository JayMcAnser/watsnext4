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
  let ids = String(req.query.artist);
  if (ids.indexOf(',') > 0) {
    ids = ids.split(',')
  } else {
    ids = [ids]
  }
  let type = Number(req.query.type) % 3;
  let names = []
  for (let index = 0; index < ids.length; index++) {
    let artists = await Artist.find({agentId: String(ids[index])})
    if (!artists.length) {
      console.log(`artist ${ids[index]} was not found`)
      continue
    }
    let artist = artists[0]
    artist.royaltiesPeriod = type;
    await artist.save();
    names.push(artist.name)
  }
  return `change ${names.join(', ')} to type: ${type} (${['Yearly','Quarterly', 'Monthly'][type]})`
}

module.exports = {
  jobRoyaltyType
}
