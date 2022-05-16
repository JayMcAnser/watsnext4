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
    artistSet = await Agent.find({wikipedia: {$exists: true}})
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
    options.imageProcess.artistId = artistSet[index].agentId;
    if (!options.silent) {
      let rotate = ['|','/','-','\\'];
      process.stdout.write(`${rotate[index % 4]} ${index + 1} (name: ${artistSet[index].name})`.padEnd(79, ' ') + '\r');
    }
    let result = await processArtistV2(artistSet[index], connections, options)
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

const storeArtistError = async function(artist, status, error) {
  artist.wikipediaStatus = status;
  artist.wikipediaError = error;
  artist.wikipediaDoc = '';
  artist.wikipediaSha = '';
  artist.wikipediaLastChanged = new Date();
  artist.wikipediaSha = undefined;
  artist.hasWikiBiography = 0;
  await artist.save();
}

const storeArtistReset = async function(artist) {
  artist.wikipediaStatus = '';
  artist.wikipediaError = '';
  await artist.save();
}

/**
 * check for a valid biography by the rules defined in the config
 * @param json
 * @return {string} Error message or ''
 */
const validateBiographyText = function(json) {
  if (!json.bio || !Array.isArray(json.bio) || json.bio.length < Config.get('Mediakunst.biographyRules.minSegments')) {
    return 'no segements';
  }
  let bio = json.bio;
  if (!Array.isArray(bio[0].paragraphs) || bio[0].paragraphs.length < Config.get('Mediakunst.biographyRules.firstSegmentParagraphCount')) {
    return 'not enough paragraphs'
  }
  let para = json.bio[0].paragraphs[0];
  let s = '';
  // validate the min length of the paragraph
  if (para.sentences && Array.isArray(para.sentences)) {
    for (let index = 0; index < para.sentences.length; index++) {
      s += para.sentences[index].text
    }
  }
  if (s.length < Config.get('Mediakunst.biographyRules.firstSegmentTextLength')) {
    return 'not enough text'
  }
  return '';
}

/**
 * Store the found information in the mySQL mediakunst database
 * @param mkArtist The mySQL record
 * @param wikiBio String the bio to store
 * @param imageFilename String the filename of for the image
 * @return {Promise<Boolean>}
 */
const storeInMySql = async function(mkArtist, wikiBio, imageFilename = undefined) {
  try {
    // work in the mediakunst db where the artist is a text.json structure
    // parse the json structure of the record
    let mkJson = JSON.parse(mkArtist.data_json);
    mkJson.hasWikiBiography = (!wikiBio || wikiBio.length === 0) ? 0 : 1
    mkJson.hasBiography = mkJson.hasBiography || mkJson.hasWikiBiography;
    try {
      mkJson.wikiBiography = wikiBio; // JSON.parse(doc);
      delete mkJson.wikiBiographyJson
    } catch (e) {
      // if error store Json for debugging
      mkJson.wikiBiographyJson = wikiBio
      delete mkJson.wikiBiography
    }
    if (imageFilename) {
      mkJson.imageUrl = imageFilename
    } else {
      delete mkJson.imageUrl
    }
    await connection.mediakunst.query(`UPDATE doc
                                       SET ` +
      `data_json = ${connection.mediakunst.escape(JSON.stringify(mkJson))} ` +
      `WHERE ` +
      `id = ${mkArtist.id}`)

    return true
  } catch(e) {
    console.log(`unexpected error in saving to mySQL: ${e.message}`)
    return false;
  }
}


const _setError = function(artist, err, status, message, isError = true) {
  artist.wikipedia.status = status;
  artist.wikipedia.error = message;
  err.status = status;
  err.message = message
  err.isError = isError;
}
/**
 * processing the artist:
 * it has two parts:
 *   * changing the mongoDB artist so it store the newly generated data, the errors, change flags and messages
 *   * sync the mySQL database information in the mongoDB
 * if no changes are made the mySQL should still be update so keep in sync!
 *
 * in the mongoDB the error reporting is done in the var:
 *    - status the text code to represent the error
 *    - error the text message that was generated
 *
 * @param artist
 * @param connection
 * @param options
 * @return {Promise<{action: string, message: string, status: string}|*>}
 */


const processArtistV2 = async function (artist, connection, options = {}) {
  let err = {isError: false, status: 'stored', message: ''}
  if (!artist.wikipedia) {
    artist.wikipedia = {}
    _setError(artist, err, 'wikipedia-missing', 'the wikipedia section is missing')
  }
  // clear wiki status from artist
  artist.wikipedia.status = '';
  artist.wikipedia.error = '';

  // find the id
  let qId;
  if (!err.isError) {
    qId = artist.wikipedia.id;
    if (!qId) {
      _setError(artist, err,'qid-missing', `artist ${artist.agentId} has no wiki Qid`)
    }
  }

  // ----
  // load the mySQL artist
  let mkArtist = false;
  if (!err.isError) {
    let mediakunstId = `artist-${artist.agentId}`;
    mkArtist = await connection.mediakunst.query(`SELECT * FROM doc WHERE guid="${mediakunstId}"`)
    if (mkArtist.length === 0) {
      _setError(artist, err, 'not-part-of-mediakunst', `the artist ${artist.name} (${mediakunstId}) is not part of mediakunst`)
    } else {
      mkArtist = mkArtist[0];
    }
  }

  // -----
  // load the information from wikipedia
  let wikiBiography = '';   // --> the biography
  let wikiImageName = '';       // --> the image belonging to this bio
  if (!err.isError) {
    // get the merged content of the biography
    let json;
    try {
      // if (debug) { debug(`retrieving ${qId}`)}
      json = await Wikipedia.qIdToJson(qId, artist.name, options);
      if (json.error) {
        _setError(artist, err, 'no-article', json.error);
      } else {
        // validate the biography (size, etc)
        let errMsg = validateBiographyText(json);
        if (errMsg.length > 0) {
          _setError(artist, err, 'no-valid-bio', errMsg);
        }
        if (!err.isError) {
          wikiBiography = await Wikipedia.merge(json, options.templateFileName, true, options);
          let docDef = sha1(wikiBiography)
          if (!artist.sha || docDef !== artist.wikipedia.sha) {
            artist.wikipedia.doc = wikiBiography;
            artist.wikipedia.sha = docDef;
            artist.wikipedia.lastChanged = new Date();
            artist.wikipedia.status = 'retrieved';
          }
          // the image is NOT part of the check
          wikiImageName = json.images && json.images.length ? json.images[0].filename: undefined
          artist.wikipedia.imageName = wikiImageName;
        }
      }
    } catch (e) {
      // write the error to the artist record so it can be reconvered
      if (e.message === 'Request failed with status code 404') {
        _setError(artist, err,'error-not-found', `artist ${artist.agentId} (Qid: ${qId}} does not exist in the Wikipedia`)
      } else {
        _setError(artist, err, 'error-retrieve', e.message)
      }
    }
  }

  // wikiBiography now holds the biography
  // wikiImageName holds the image

  // parse the mySQL data blob
  let mkJson
  if (mkArtist) {
    try {
      mkJson = JSON.parse(mkArtist.data_json);
    } catch (e) {
      _setError(artist, err, 'doc-error', `artist artist-${artist.agentId} document in mediakunst returns an error`)
    }

    // store the information
    if (!err.isError && mkJson) {
      mkJson.hasWikiBiography = wikiBiography.length === 0 ? 0 : 1
      mkJson.hasBiography = mkJson.hasBiography || mkJson.hasWikiBiography; // switch between the biographies
      mkJson.wikiBiography = wikiBiography; // JSON.parse(doc);
      if (wikiImageName) {
        mkJson.imageUrl = wikiImageName
      } else {
        delete mkJson.imageUrl
      }
    } else if (mkJson) {
      // if we have an error, we must remove the wiki information
      // the error is stored in the mongo DB
      mkJson.hasWikiBiography = 0;
      delete mkJson.wikiBiography
      delete mkJson.imageUrl;
    }

    // update the website to the new definition only if we have info
    if (mkJson) {
      try {
        await connection.mediakunst.query(
          `UPDATE doc
           SET ` +
          `data_json = ${connection.mediakunst.escape(JSON.stringify(mkJson))} ` +
          `WHERE ` +
          `id = ${mkArtist.id}`)
      } catch (e) {
        _setError(artist, err, 'mysql-erro', e.message);
      }
    }
  }
  // update watsnext to the new defintion
  try {
    await artist.save();
  } catch (e) {
    return {status: 'error', message: `saving artist ${artist.agentId} in mongoDB return the error: ${e.message}`, action: 'skipped'}
  }
  return {status: err.status, message: err.message, action: 'done'}
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
  let mediakunstId = `artist-${artist.agentId}`;
  let mkArtist = await connection.mediakunst.query(`SELECT * FROM doc WHERE guid="${mediakunstId}"`)
  if (mkArtist.length === 0) {
    await storeArtistError(artist, 'not-part-of-mediakunst', `the artist ${artist.name} (${mediakunstId}) is not part of mediakunst`)
    return {status: 'warn', message: `artist ${artist.agentId} is not part of Mediakunst`, action: 'skip'}
  }
  mkArtist = mkArtist[0]

  if (!options.imageRoot) {
    options.imageRoot = Config.get('Path.imageRoot')
  }
  options.imageRoot = getFullPath(options.imageRoot, {})
  Fs.mkdirSync(options.imageRoot, {recursive: true})
  if (debug) { debug(`images copied to ${options.imageRoot}`)}
  // get the merged content of the biography
  let doc;
  let json;
  try {
    if (debug) { debug(`retrieving ${qId}`)}
    json = await Wikipedia.qIdToJson(qId, artist.name, options);
    if (json.error) {
      await storeArtistError(artist, 'no-wiki', json.error);
      return {status: 'warning', message: `artist ${artist.agentId} (Qid: ${artist.wikipediaId}) returns an error: ${json.error}`, action: 'wikipedia'}
    } else {
      artist.wikipediaError = validateBiography(json);
      if (artist.wikipediaError.length) {
        await storeArtistError(artist, 'no-valid-bio', artist.wikipediaError);
        return {status: 'error', message: `artist ${artist.agentId} (Qid: ${artist.wikipediaId}) is not valid: ${artist.wikipediaError}`, action: 'wikipedia'}
      }
      doc = await Wikipedia.merge(json, options.templateFileName, true, options)
      artist.wikipediaStatus = 'retrieved'
    }
    await storeArtistReset(artist)
  } catch (e) {
    // write the error to the artist record so it can be reconvered
    if (e.message === 'Request failed with status code 404') {
      await storeArtistError(artist, 'error-not-found', `artist ${artist.agentId} (Qid: ${qId}} does not exist in the Wikipedia`)
      return {status: 'error', message: `artist ${artist.agentId} (Qid: ${artist.wikipediaId}) does not exist`, action: 'wikipedia'}
    } else {
      await storeArtistError(artist, 'error-retrieve', e.message)
      return {status: 'error', message: `wiki for artist ${artist.agentId} (${artist.wikipediaId}) thrown error: ${e.message}`, action: 'wikipedia'}
    }
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
    await storeInMySql(mkArtist, doc, json.images && json.images.length ? json.images[0].filename: undefined)
    return {status: 'info', message: `artist ${artist.name} (${artist.wikipediaId}) saved`, action: status}
  } catch (e) {
    await storeInMySql(mkArtist, doc)
    return {status: 'error', message: `storing artist info${artist.agentId} (${artist.wikipediaId}) thrown error: ${e.message}`, action: 'store'}
  }

}

const debug = (msg) => {
  console.log(msg)
}
module.exports = {
  jobWikipedia
}
