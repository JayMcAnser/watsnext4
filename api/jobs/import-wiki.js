/**
 * Job to import the qid from the wikipedia into watsnext
 * version 1.0  dd: 2021-10-11  @Jay
 *
 * Input a csv file with the
 * {limaId}, {wikipediaId}
 *
 */
const Config = require('config')
const Fs = require('fs')
const parse = require('csv-parse/sync').parse
const getFullPath = require('../vendors/lib/helper').getFullPath
const MongoDb = require('../lib/db-mongo');
const Agent = require("../model/agent");
const setRelativePath = require('../vendors/lib/helper').setRelativePath;
setRelativePath('')
// setRootPath(__dirname + '/..')
/**
 *
 * @param filename string the name of the file to parse
 * @return {Promise<>Array<rows>}
 */
const importFile = async (filename) => {
  let trueFileName = getFullPath(filename, {rootKey: 'Path.importRoot', noExistsCheck: true})
  if (!trueFileName || !Fs.existsSync(trueFileName)) {
    throw new Error(`the file ${filename}  (looked for ${trueFileName}) does not exist`)
  }
  let content = Fs.readFileSync(trueFileName, {encoding: Config.get('Import.csv.encoding')});
  let records = parse(content, {
    delimiter: Config.get('Import.csv.delimiter'),
    trim: true,
    encoding: Config.get('Import.csv.encoding'),
    skip_empty_lines: true,
    comment: Config.get('Import.csv.comment'),
    columns: true
  });
  return records;
}

/**
 * parse the info into the db
 * @param limaId
 * @param wikiId
 * @return {Promise<void>}
 */
const parseRecord = async (limaId, wikiId) => {
  let limaAgentId =  limaId.toString().substr('artist-'.length)
  let artist = await Agent.findOne({agentId: limaAgentId})
  if (!artist) {
    return {status: 'error', message: `artist ${limaId} not found in watsnext`, action: 'not found'}
  }
  // temp to clean the database

  if (!artist.wikipedia) {
    artist.wikipedia = {}
  }
  if ((!artist.wikipedia.id || artist.wikipedia.id !== wikiId)) {
    artist.wikipedia.id = wikiId;
    artist.wikipedia.lastChanged = new Date();
    await artist.save();
    return {status: 'debug', message: `artist ${limaId} / wiki ${wikiId} updated`, action: 'changed'}
  }
  return {status: 'debug', message: `artist ${limaId} / wiki ${wikiId} not changed`, action: 'nop'}
}

/**
 * this defines all the fields that can be found in the csv
 *
 * @param record
 * @return false on unparseble record and record if it's ok
 */
const getArtistInfo = function(record) {
  let result = {mediakunstId: '', wikiId: ''};
  if (record.hasOwnProperty('item')) { // thats http://www.wikidata.org/entity/Q20164615
    result.wikiId = record.item.substr('http://www.wikidata.org/entity/'.length)
  }
  if (record.hasOwnProperty('LIMA_media_artist_ID')) {
    result.mediakunstId = `artist-${record.LIMA_media_artist_ID}`
  }
  if (record.hasOwnProperty('limaId')) {
    result.mediakunstId = record.limaId
  }
  if (record.hasOwnProperty('wikiId')) {
    result.wikiId = record.wikiId
  }
  if (result.mediakunstId.length && result.wikiId.length) {
    return result;
  }
  return false;
}

/**
 *
 * @param filename
 * @param options {
 *    debug: boolean list actions done
 *    reset: boolean remove existing wikipedia ids
 * }
 * @return {Promise<*[]>}
 */
const jobImportWiki = async (filename, options= {}) => {
  if (options.debug) { debug(`importing ${filename}`) }
  let records = await importFile(filename);
  if (records) {
    // if (Config.get('Import.csv.hasFieldNames')) {
    //   records.splice(0, 1)
    // }
    let mongoDb = await MongoDb.connect();
    if (options.debug) { debug(`found ${records.length} records`) }
    if (options.reset) {
      await Agent.updateMany({'wikipedia.id': {'$exists': true}}, {wikipedia: {id: undefined}})
    }
    // await Agent.updateMany({}, {$unset: {wikipediaId: '', wikipediaLastChanged: '', wikipediaDoc: '', wikipediaSha: '', wikipediaStatus: '', wikipediaError: '', imageId: ''}})
    let result = []
    for (let index = 0; index < records.length; index++) {
      if (!options.silent) {
        let rotate = ['|','/','-','\\'];
        process.stdout.write(`artist: ${rotate[index % 4]} ${index}\r`);
      }
      let artist = getArtistInfo(records[index])
      if (artist) {
        result.push(await parseRecord(artist.mediakunstId, artist.wikiId)) // await parseRecord(records[index][0], records[index][1]))
      } else {
        if (options.debug) {
          debug(`could not parse: ${JSON.stringify(records[index])}`)
        }
      }
    }
    return result;
  } else {
    if (options.debug) { debug('found no records!') }
    return []
  }
}

const debug = (msg) => {
  console.log(msg)
}
module.exports = {
  jobImportWiki
}
