/**
 * Job to import  and combine information from wikipedia, and watsnext into mediakunst
 *
 * The routine expects:
 *   -- the mongoDb is fully loaded with the latest watsnext information (it should import this before the call)
 *   -- the mediakunst database is fully loaded and parsed with the latest watsnext information
 *
 *  what is does:
 *    -- it selects all artist in the mediakunst database
 *
 *    -- for all artists:
 *    -- finds the artist in the mongoDb
 *    -- checks if there is a wikipedia id
 *    -- if so it will retrieve the wikipedia page
 *       -- parse it and download the image from it
 *       -- stores the resulting hmlt in the mediakunst database in the artist record
 *       -- set hasBiography and hasWikiBiography
 *    -- if not it will remove the hasWikiBiography if set
 *
 *    -- when done it return an array with the id, name, result (error) for all record
 *    -- on fatal error it throws an error
 *
 * The Vasulkas  watsnext: 72, wikipedia (Q3482323)
 */
const MongoDb = require('../lib/db-mongo');
const Agent = require('../model/agent');
const Logging = require('../vendors/lib/logging');




const jobWikipedia = async () =>  {
  let connections = await buildConnections();
  let artistSet = await connections.mediakunst.query('SELECT id FROM doc WHERE guid LIKE "artist-%"')
  debug(`found ${artistSet.length} artists to process`);

  let log = []
  for (let index = 0; index < artistSet.length; index++) {
    let result = await processArtist(artistSet[index].id, connections)
    log.push(result);
    //if (index > 10) {  break; }
  }
  return log
  //return Promise.resolve()
}

/**
 * connects to the databases
 * @return {Promise<{mongo, mediakunst}>}
 */
const buildConnections = async () => {
  let result = {};
  result.mongo = await MongoDb.connect();
  let con = require('../lib/db-mediakunst')
  await con.connect()
  result.mediakunst = con.connection
  return result
}

/**
 * @param id string (3) the watsnext.id of the artist to process
 * @param connection object the object with all connection
 * @return an object holding the status of the process
 */
const processArtist = async (id, connection) => {
  try {
    // find the id in the mongoDb
    let watsnextArtist = await Agent.findOne({agentId: id})
    if (watsnextArtist) {
      if (watsnextArtist.wikipediaId) {

      } else {

      }
    } else {
      return {status: 'error', message: `artist ${id} not found in watsnext`, action: 'skip'}
    }
  } catch (e) {
    return {status: 'error', message: `artist ${id} thrown error: ${e.message}`, action: 'skip'}
  }
}

const debug = (msg) => {
  console.log(msg)
}
module.exports = {
  jobWikipedia
}
