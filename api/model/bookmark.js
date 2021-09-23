/**
 * the bookmarks
 * version 0.0.1 Jay 2021-09-20
 */

const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const ErrorTypes = require('error-types');
const UndoHelper = require('mongoose-undo');
const Logging = require('../vendors/lib/logging');
const ModelHelper = require('./model-helper');
const Config = require('config');


const BookmarkLinkSchema = new Schema({
  agent: {
    type: Schema.ObjectId,
    ref: 'Agent'
  },
  art: {
    type: Schema.ObjectId,
    ref: 'Art'
  },
  carrier: {
    type: Schema.ObjectId,
    ref: 'Carrier'
  }
})
const BookmarkLayout = {
  bookmarkId: String,
  type: String,
  name: String,
  user: String,
  isGlobal: Boolean,
  isTemp: Boolean,
  isMediakunst: Boolean,
  items: [BookmarkLinkSchema],
}
let BookmarkSchema = new Schema(BookmarkLayout)
BookmarkSchema.plugin(UndoHelper.plugin);
const MEDIAKUNST_ID =  Config.has('Mediakunst.id') ? Config.get('Mediakunst.id') : 2423;

/**
 * returns the list used for Mediakunst
 */
BookmarkSchema.methods.Mediakunst = function() {
  return Bookmark.findOne({bookmarkId: MEDIAKUNST_ID})
}
/**
 * Reset the marker in the art work / artist so the works are part of mediakunst
 * @constructor
 */
BookmarkSchema.methods.MediakunstRefresh = async function() {

}

let Bookmark = Mongoose.Model('Bookmark', BookmarkSchema);

module.exports = Bookmark;
module.exports.MEDIAKUST_ID = MEDIAKUNST_ID;
