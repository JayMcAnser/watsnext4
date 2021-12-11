/**
 * Job to import the qid from the wikipedia into watsnext
 * version 1.0  dd: 2021-10-11  @Jay
 *
 *  csv config can be set in the config by the key: Import.csv
 *
 */
const Config = require('config')
const Fs = require('fs')
const parse = require('csv-parse/sync').parse
const getFullPath = require('../vendors/lib/helper').getFullPath
const setRootPath = require('../vendors/lib/helper').setRootPath
const MongoDb = require('../lib/db-mongo');
const Agent = require("../model/agent");

setRootPath(__dirname + '/..')
const keyValue = (key) => {
  return Config.has(`Import.wiki.${key}`) ?  Config.get(`Import.wiki.${key}`) :  Config.get(`Import.csv.${key}`)
}
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
  let content = Fs.readFileSync(trueFileName);
  let records = parse(content, {
    delimiter: keyValue('delimiter'),
    trim: true,
    encoding: keyValue('encoding'),
    skip_empty_lines: true,
    comment: keyValue('comment'),
    columns: false
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
  let artist = await Agent.findOne({agentId: limaId})
  if (!artist) {
    return {status: 'error', message: `artist ${limaId} not found in watsnext`, action: 'not found'}
  }
  if (!artist.wikipediaId || artist.wikipediaId !== wikiId) {
    artist.wikipediaId = wikiId;
    artist.wikipediaLastChanged = new Date();
    await artist.save();
    return {status: 'debug', message: `artist ${limaId} / wiki ${wikiId} updated`, action: 'changed'}
  }
  return {status: 'debug', message: `artist ${limaId} / wiki ${wikiId} not changed`, action: 'nop'}
}


const jobImportWiki = async (filename, options= {}) => {
  if (options.debug) { debug(`importing ${filename}`) }
  let records = await importFile(filename);
  if (records) {
    if (keyValue('hasFieldNames')) {
      records.splice(0, 1)
    }
    let mongoDb = await MongoDb.connect();
    if (options.debug) { debug(`found ${records.length} records`) }
    if (options.reset) {
      await Agent.updateMany({wikipediaId: {'$exists': true}}, {wikipediaId: undefined})
    }
    let result = []
    for (let index = 0; index < records.length; index++) {
      result.push(await parseRecord(records[index][0], records[index][1]))
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
