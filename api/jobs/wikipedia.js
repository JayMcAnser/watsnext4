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
// const Logging = require('../vendors/lib/logging');
const Wikipedia = require('../wikipedia');
const Config = require('config')
const ImageClass = require('../wikipedia').ImageProcess
const getFullPath = require('../vendors/lib/helper').getFullPath

// const setRootPath = require('../vendors/lib/helper').setRootPath
// setRootPath(__dirname + '/..')
const Fs = require('fs')
const sha1 = require('sha-1')
const Path = require("path");

/**
 * class to rename the images to the artist-{id}.jpg format for universal access
 *
 */
class ArtistImage extends ImageClass {
  constructor(props) {
    super(props);
    this.imagePath = getFullPath('', {rootKey: 'Path.imageRoot', noExistsCheck: true})
    this.artistId = props ? props.artistId : undefined
  }

  createWriteStream(requestInfo) {
    // let path = Path.join(this.imagePath, name, extension);
    requestInfo.filename = `artist-${this.artistId + Path.extname(requestInfo.filename)}`;
    return super.createWriteStream(requestInfo)
    // requestInfo.fullPath = Path.join(this.imagePath, `artist-${this.artistId + Path.extname(requestInfo.filename)}`)
    // if (Fs.existsSync(requestInfo.fullPath)) {
    //   Fs.unlinkSync(requestInfo.fullPath)
    // }
    // return Fs.createWriteStream(requestInfo.fullPath);
  }
}

/**
 *
 * @param options
 *   id: string the limaId of the artist to import. If missing ALL artist with an id are imported
 *   reset: boolean all artists are update to the latest version if if not changed
 *   debug: boolean list what has been done
 *   template: string the template to use. Default Mediakunst.biographyTemplate
 * @return {Promise<*[]>}
 */
const jobWikipedia = async (options= {}) =>  {
  let connections = await buildConnections();
  let artistSet;
  if (options.id) {
    artistSet = await Agent.find({agentId: options.id})
  } else {
    artistSet = await Agent.find({wikipediaId: {$exists: true}})
  }
  if (options.debug) { debug(`found ${artistSet.length} artists to process`) }
  let template = options.template ? options.template : Config.get('Mediakunst.biographyTemplate')
  options.templateFileName = getFullPath(template, {rootKey: 'Path.templateRoot', noExistsCheck: true, relativeTo: ''})
  if (!Fs.existsSync(options.templateFileName)) {
    throw new Error(`the template ${options.templateFileName} does not exist`)
  }
  if (options.debug) { debug(`using template ${options.templateFileName}`)}
  options.imageProcess = new ArtistImage()
  options.imagePath = getFullPath('', { rootKey: 'Path.imageRoot', noExistsCheck: true})
  if (debug) { debug(`image path ${options.imagePath}`)}
  let log = []
  for (let index = 0; index < artistSet.length; index++) {
    options.imageProcess.artistId = artistSet[index].agentId
    let result = await processArtist(artistSet[index], connections, options)
    log.push(result);
  }
  return log
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
 * @param artist - the artist record
 * @param connection object the object with all connection
 * @param options Object the extra info for the config
 * @return an object holding the status of the process
 */
const processArtist = async (artist, connection, options) => {
  let qId = artist.wikipediaId;
  if (!qId) {
    return {status: 'error', message: `artist ${artist.agentId} has no wiki Qid`, action: 'wikipedia'}
  }
  let mkArtist = await connection.mediakunst.query(`SELECT * FROM doc WHERE guid="artist-${artist.agentId}"`)
  if (mkArtist.length === 0) {
    return {status: 'warn', message: `artist ${artist.agentId} is not part of Mediakunst`, action: 'skip'}
  }
  mkArtist = mkArtist[0]

  if (!options.imageRoot) {
    options.imageRoot = Config.get('Path.imageRoot')
  }
  options.imageRoot = getFullPath(options.imageRoot, {})
  Fs.mkdirSync(options.imageRoot, {recursive: true})
  // get the merged content of the biography
  let doc;
  let json;
  try {
    if (debug) { debug(`retrieving ${qId}`)}
    json = await Wikipedia.qIdToJson(qId, artist.name, options)
    doc = await Wikipedia.merge(json, options.templateFileName, true, options)
  } catch (e) {
    return {status: 'error', message: `wiki for artist ${artist.agentId} (${artist.wikipediaId}) thrown error: ${e.message}`, action: 'wikipedia'}
  }

  let status = 'done'
  try {
    let key = sha1(doc);
    if (options.reset || artist.wikipediaSha !== key || artist.wikipediaDoc !== doc) {
      // store the artist into the mongoDB
      if (options.debug) { debug(`updating watsnext agentId = ${artist.agentId}`)}
      // store the change in the db. so it can be checked
      artist.wikipediaSha = key;
      artist.wikipediaDoc = doc;
      artist.wikipediaLastChanged = new Date();
      await artist.save()
      status = 'changed'
    }

    // work in the mediakunst db where the artist is a text.json structure
    // parse the json structure of the record
    let mkJson = JSON.parse(mkArtist.data_json);
    mkJson.hasWikiBiography = 1;
    mkJson.hasBiography = 1;
    try {
      mkJson.wikiBiography = doc; // JSON.parse(doc);
      delete mkJson.wikiBiographyJson
    } catch (e) {
      // if error store Json for debugging
      mkJson.wikiBiographyJson = doc
      delete mkJson.wikiBiography
    }
    if (json.images.length) {
      mkJson.imageUrl = json.images[0].filename
    } else {
      delete mkJson.imageUrl
    }
    await connection.mediakunst.query(`UPDATE doc SET ` +
        `data_json = ${connection.mediakunst.escape(JSON.stringify(mkJson))} ` +
        `WHERE ` +
        `id = ${mkArtist.id}`)

    return {status: 'info', message: `artist ${artist.name} (${artist.wikipediaId}) saved`, action: status}
  } catch (e) {
    return {status: 'error', message: `storing artist info${artist.agentId} (${artist.wikipediaId}) thrown error: ${e.message}`, action: 'store'}
  }

}

const debug = (msg) => {
  console.log(msg)
}
module.exports = {
  jobWikipedia
}
