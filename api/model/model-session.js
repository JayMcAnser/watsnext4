/**
 * ModelSession
 *
 * The combine write session for temporaray updates
 * version 0.0.1 JayMcAnser 2021-07-03
 */

const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const uuid = require('uuid').v4;
const Config = require('config')
const Logging = require('../vendors/lib/logging')
const Moment = require('moment');

let SessionMerge = {}
/**
 *
 * @param period String: '2 sec', '21 sec', 2, '2 min', '1 hour'
 */
const expireAfter = function(period = undefined) {
  if (period) {
    let periodParts = period.split(' ');
    if (periodParts.length === 1) {
      SessionMerge = {count: Number(periodParts[0]), type: 'seconds'}
    } else if (['days', 'hours', 'minutes', 'seconds', 'milliseconds', 'd', 'h', 'm', 's', 'ms'].includes(periodParts[1].toLowerCase())) {
      SessionMerge = {count: Number(periodParts[0]), type: periodParts[1]}
    } else {
      Logging.log('error', `unknown format for session expire: ${period}`, 'model-session.expireAfter');
      SessionMerge = {count: 1, type: 'minute'}
    }
  }
  return SessionMerge
}
// the time until session writes are not merged any more
expireAfter(Config.get('Database.Mongo.sessionMerge'));

const ModelSession = {
  model: String,        // 'art'
  key: String,          // '38u4987923423'
  originalData: Object, // org data
  expire: Date          // when it expires
}

let ModelSessionSchema = new Schema(ModelSession);

ModelSessionSchema.statics.create = function(fields) {
  fields.key = uuid();
  fields.expire = Date()
  let Session = Mongoose.Model('ModelSession', this.schema);
  let session  = new Session(fields);

  return session.save();
}

/**
 * find the session based upon the client key and expires it if not valid anymore
 *
 * @param key
 * @return {*}
 */
ModelSessionSchema.statics.findByKey =  function(key) {
  return this.findOne({key: key}).then((rec) => {
    if (rec) { // validate that the rec is still valid
      let expiredIfBefore = Moment().subtract(SessionMerge.count, SessionMerge.type)
      if (expiredIfBefore < rec.expire) {
        // access makes it being used again
        rec.expire = Date();
        return this.updateOne({_id: rec._id}, rec).then(() => {
          return rec;
        });
      }
      // remove the record because it's expired
      return this.deleteOne({_id: rec._id}).then( () => {
        return false;
      })
    }
    return false;
  })
}

module.exports = Mongoose.Model('ModelSession', ModelSessionSchema);
module.exports.expireAfter = expireAfter;

