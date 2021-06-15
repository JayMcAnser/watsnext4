/**
 * Setup the security system
 *
 * version 0.0.1 JvK 2020-03-17
 * version 0.0.2 Jay 2020-06-02 - rebuild
 */
const Group = require('../model/group');
const User = require('../model/user-model');
const Contact = require('../model/contact');
const Carrier = require('../model/carrier');
const Config = require('config');
const Const = require('../lib/const');
const Logging = require('../vendors/lib/logging');


class Setup {

  checkConfig() {
    let err = false;
    if (!Config.has('Database.Mongo.rootPassword')) {
      Logging.log('error', `missing 'Database.Mongo.rootPassword'`);
      err = true;
    }
    if (!Config.has('Database.Mongo.rootEmail')) {
      Logging.log('error', `missing Database.Mongo.rootEmail`);
      err = true;
    }

    return err;
  }

  /**
   * create the default groups for root access
   * @return {Promise<void>}
   */
  async createGroups() {

    let grp = await Group.findOne({name: 'root'});
    if (!grp) {
      grp = await Group.create({ name: 'root', rights: {module: 'system', rights: Const.rights.RIGHTS_ALL} })
    }
    return grp;
  }

  async createRootUsers(grp) {
    let rootUser = await User.findOne({ username: 'root'});
    if (!rootUser) {
      rootUser = await User.create({username: 'root', email: Config.get('Database.Mongo.rootEmail'), password: Config.get('Database.Mongo.rootPassword') })
    }
    grp.userAdd(rootUser);
    await rootUser.save();
    return true;
  }

  async createContact(session) {
    let contact = await Contact.findOne({guid: 'DISTR_NOT_FOUND'});
    if (!contact) {
      contact = await Contact.create(session, {addressId: -1, guid: 'DISTR_NOT_FOUND', name: 'Distribution contact not found'})
      await contact.save();
    }
    return true;
  }

  async createCarrier(session) {
    let carrier = await Carrier.queryOne(session, {locationNumber: 'CARRIER_NOT_FOUND'});
    if (!carrier) {
      carrier = await Carrier.create(session, {carrierId: -1, locationNumber: 'CARRIER_NOT_FOUND', comments: 'Carrier not found by importer'})
      await carrier.save()
      let c = await Carrier.queryOne(session,{locationNumber: 'CARRIER_NOT_FOUND'});
      if (!c) {
        Logging.logThrow('could not find/create carrier with locationNumber: CARRIER_NOT_FOUND', 'setup.createCarrier');
      }
    }
    return true;
  }
  /**
   * check the system for errors
   * @return {Promise<boolean>}
   */
  async run(session) {
    if (this.checkConfig()) {
      return false;
    }
    let grp = await this.createGroups();
    let usr = await this.createRootUsers(grp);
    let addr = await this.createContact(session);
    let carr = await this.createCarrier(session);
    return Promise.resolve(!!usr)
  }
}
const runSetup = function(session) {
  let setup = new Setup();
  return setup.run(session)
}
module.exports = Setup;
module.exports.runSetup = runSetup;
