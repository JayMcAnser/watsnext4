/**
 * import the bookmark information
 * verion 0.0.1 Jay 2021-09-20
 */

const DbMySQL = require('../lib/db-mysql');
const Bookmark = require('../model/bookmark');
const Logging = require('../vendors/lib/logging');
const recordValue = require('../import/import-helper').recordValue;
const ImportHelper = require('./import-helper');
const ArtImport = require('./art-import');
const AgentImport = require('./agent-import');
const CarrierImport = require('./carrier-import');




const FieldMap = {
  bookmarkId: 'bookmark_ID',
  type: (rec, mongoRec) => {
    switch(rec.type_ID) {
      case 1: return 'contact';
      case 2: return 'art';
      case 3: return 'carrier';
      case 4: return 'artist';
      case 5: return 'documentation';
      case 6: return 'event';
      case 7: return 'distribution';
      default: return `err-${rec.objecttype_ID}`;
    }
  },
  name: 'name',
  user: 'user_ID',
  isGlobal: 'is_global',
  isTemp: 'is_temp',
};

class BookmarkImport {

  constructor(options = {}) {
    const STEP = 50;
    this.session = options.session;
    this._limit = options.limit !== undefined ? options.limit : 0;
    this._step = (this._limit && this._limit < STEP) ? this._limit : STEP;
    this._artImport = new ArtImport({session: this.session});
    this._agentImport = new AgentImport({session: this.session});
  }

  /**
   * import one carrier record if it does not exist
   *
   * @param con
   * @param record
   * @param options { limit }
   * @return {Promise<*>}
   * @private
   */
  async _convertRecord(con, record, options = {}) {
    try {
      let bookmark = await Bookmark.findOne(this.session, {bookmarkId: record.bookmark_ID});
      if (!bookmark) {
        bookmark = await Bookmark.create(this.session, {bookmarkId: record.bookmark_ID});
      }
      let dataRec = {};
      for (let fieldName in FieldMap) {
        if (!FieldMap.hasOwnProperty(fieldName)) {
          continue
        }
        dataRec[fieldName] = await recordValue(record, FieldMap[fieldName], Bookmark);
      }
      // warn: we only import art for now
      if (dataRec.type && dataRec.type !== 'art') {
        Logging.log('error', `Bookmarks only import art. got ${dataRec.type}`)
        throw new Error('unable to import bookmarklist')
      }
      try {
        // process the bookmark items
        let sql = `SELECT *
                   FROM bookmark_items
                   WHERE bookmark_ID = ${record.bookmark_ID}`;

        let qry = await con.query(sql);
        dataRec.items = [];
        if (qry.length) {
          for (let l = 0; l < qry.length; l++) {
            // let artId = qry[l].art_ID;
            let id = qry[l].ID;
            let art = await this._artImport.runOnData({art_ID: qry[l].ID}, {loadSql: true}); // we have only artId, so look for the art
            if (art) {
              dataRec.items.push({art: art._id});
            }
            if (options.limit && options.limit < l) {
              break;
            }
          }
        } else {
          dataRec['noArt'] = true;
        }
        Object.assign(bookmark, dataRec);
        bookmark = await bookmark.save();
      } catch (e) {
        Logging.log('error', `error importing bookmark[${record.bookmark_ID}]: ${e.message}`)
      }
      return bookmark;
    } catch(e) {
      Logging.log('error', e.message, 'bookmark-import._convertRecord')
      throw e
    }
  }

  async run(con) {
    let vm = this;
    return new Promise(async (resolve, reject) => {
      let start = 0;
      ImportHelper.stepStart('Bookmark');
      let counter = { count: 0, add: 0, update: 0, errors: []};
      let qry = [];
      do {
        let dis;
        let sql = `SELECT * FROM bookmarks ORDER BY bookmark_ID LIMIT ${start * vm._step}, ${vm._step}`;
        qry = await con.query(sql);
        if (qry.length > 0) {
          for (let l = 0; l < qry.length; l++) {
            await this._convertRecord(con, qry[l]);
            ImportHelper.step(counter.count++);
            if (start >= this._limit) { break }
            start++;
          }

        }
      } while (qry.length > 0 && (this._limit === 0 || counter.count < this._limit));
      ImportHelper.stepEnd('Bookmark');
      return resolve(counter)
    })
  }

  async runOnData(record) {
    let con = DbMySQL.connection;
    return await this._convertRecord(con, record);
  }

  /**
   *
   * @param bookmarkId the bookmark list to import
   * @param options { limit: max number of records to import }
   * @return {Promise<*>}
   */
  async runOnId(bookmarkId, options = {}) {
    let con = DbMySQL.connection;
    let sql = `SELECT * FROM bookmarks where bookmark_ID=${bookmarkId}`;
    let record = await con.query(sql)
    return await this._convertRecord(con, record[0], options);
  }
}

module.exports = BookmarkImport;
