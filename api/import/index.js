/**
 * the full runner
 *  v0.0.1
 *
 * run like:
 *   let Importer = require('../import');
 *   return Import.run();
 */

const Location = require('./location-import');
const DbMysql = require('../lib/db-mysql');
const Config = require('config');
const Logging = require('../vendors/lib/logging');
const User = require('../model/user-model');

module.exports = {
  run: async (limit = 0, session = undefined, ) => {
    let mysql =  await DbMysql.connect();
    if (!session) {
      if (!Config.has('Import.username') || !Config.has('Import.password')) {
        Logging.log('error', 'missing session info in config');
        return false
      }
      let user =  await User.findOne({email: Config.get('Import.username')})
      if (!user) {
        throw new Error('could find import user')

      }
      const AuthController = require('../vendors/controllers/auth')
      session =  await AuthController.createSession(user.id)
    }
    let loc = new Location({session, limit: limit});

    await loc.run(mysql);
  }
};
