/**
 * Cluster definitions
 * v: 0.0.1 @jay 2023-02-24
 */

const DbMongo = require('../lib/db-mongo');
const Schema = DbMongo.Schema;
const UndoHelper = require('mongoose-undo');
const Agent = require("./agent");

const ClusterSchema = {
  guid: {type: 'string', required: false},
  created: UndoHelper.createSchema,
  // the code.id on the old WatsNext
  codeId: {type: Number},
  text: {type: String},
  textNl: {type: String},
  description: {type: String},
  short: {type: String},
}

let ClusterModel = new Schema(ClusterSchema);

ClusterModel.plugin(UndoHelper.plugin);

ClusterModel.pre('save', async function() {
  // check there is a short
  if (!this.short || this.short.length === 0) {
    this.short = String(this.codeId) || Math.random(100000).toString(16)
  }

})
module.exports = DbMongo.Model('Cluster', ClusterModel);
