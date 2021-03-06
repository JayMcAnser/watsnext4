
const DbMongo = require('../lib/db-mongo');
const DbMySQL = require('../lib/db-mysql');
const Art = require('../model/art');
const Agent = require('../model/agent');
const Carrier = require('../model/carrier');
const Distribution = require('../model/distribution');
const Contact = require('../model/contact')
const ImportArt = require("../import/art-import");
const ImportAgent = require('../import/agent-import');
const ImportCarrier = require('../import/carrier-import');
const ImportLocation = require('../import/location-import');
const ImportContact = require('../import/contact-import');
const User = require("../model/user-model");
const Const = require("../lib/const");
const Helper = require('../vendors/lib/helper')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const setRelativePath = require('../vendors/lib/helper').setRelativePath;
const LoggingServer = require('../lib/logging-server').loggingServer;
setRelativePath('')


const Factory = require('../vendors/lib/factory');
const {results} = require("../vendors/lib/const");
Factory.register('user', () => {
  return require("../model/user-model");
})
Factory.register('session', () => {
  return require('../lib/session');
})
/**
 * import the watsnext db
 *
 * @param options
 *   debug: true to log
 *   email: the email address to use. If not exist, its created
 *   password: the password to use
 *   count: the number or records to import
 *   parts: string , seperated list of parts
 * @return {Promise<*>}
 */
const jobImportWatsNext = async (options= {}) => {

  await init();
  let output = false;
  if (options.output) {
    output = [];
  }
  let defaults = Object.assign({}, {debug: false, email: 'watsnext@li-ma.nl', password: '123456', count: 9999999, parts: false, output: false}, options)

  await LoggingServer.info(`import:watsnext.start`)
  let user =  await User.findOne({email: defaults.email})
  if (!user) {
    user = await User.create({username:'importer', email: defaults.email, password: defaults.password, isActive: true, rights:[{module: 'system', rights: Const.rights.RIGHTS_ALL}]})
    user = await user.save()
    if (!user) {
      return reject('could not create test user')
    }
  }
  const AuthController = require('../vendors/controllers/auth')
  let session = await AuthController.createSession(user.id);
  if (defaults.debug) { debug(`importing watsnext as user ${defaults.email} from ${DbMySQL.connection}`) }

  if (defaults.parts === false) {
    defaults.parts = ['art','location','carrier','contact', 'distribution']
  } else {
    defaults.parts = defaults.parts.split(',')
  }

  if (options.reset) {
    // this will remove the existing art works
    if (defaults.parts.indexOf('art') >= 0) {
      await Art.deleteMany({})
      await LoggingServer.info(`removing art`)
    }
    if (defaults.parts.indexOf('agent') >= 0) {
      await Agent.deleteMany({})
      await LoggingServer.info(`removing agent`)
    }
    if (defaults.parts.indexOf('carrier') >= 0) {
      await Carrier.deleteMany({})
      await LoggingServer.info(`removing carrier`)
    }
    if (defaults.parts.indexOf('distribution') >= 0) {
      await Distribution.deleteMany({})
      await LoggingServer.info(`removing distribution`)
    }
    if (defaults.parts.indexOf('contact') >= 0) {
      await Contact.deleteMany({})
      await LoggingServer.info(`removing contacts`)
    }
  }

  let results = []
  let logging = undefined;
  if (defaults.debug || output) {
    logging = {
      log: async function(status, message) {
        if (defaults.debug) {
          switch (defaults.debug) {
            case 1 : // errors
              if (status === 'error') {
                results.push({status, message, action: 'continue'})
              }
              break;
            case 2: // errors or warnings
              if (status === 'error' || status === 'warn') {
                results.push({status, message, action: 'continue'})
              }
              break;
            case 3: // errors warn, info
              if (status === 'error' || status === 'warn' || status === 'info') {
                results.push({status, message, action: 'continue'})
              }
              break;
            default:
              results.push({status, message, action: 'continue'})
          }
        }
        if (output) {
          output.push({status, message, action: 'continue'})
          // add the converted / errors / warnings to the csv export
        }
        if (LoggingServer[status]) {
          await LoggingServer[status](message);
        } else {
          console.error(`unknown status: ${status}`);
          await LoggingServer.error(`unknown status: ${status} - ${message}`);
        }
      }
    }
  }
  if (defaults.parts.indexOf('art') >= 0) {
    let imp = new ImportArt({session, limit: defaults.count, logging});
    await imp.run(DbMySQL)
    await LoggingServer.info(`imported art`);
  }
  if (defaults.parts.indexOf('agent') >= 0) {
    let imp = new ImportAgent({session, limit: defaults.count, logging});
    await imp.run(DbMySQL)
    await LoggingServer.info(`imported agent`);
  }
  if (defaults.parts.indexOf('carrier') >= 0) {
    let imp = new ImportCarrier({session, limit: defaults.count, logging})
    await imp.run(DbMySQL)
    await LoggingServer.info(`imported carrier`);
  }
  if (defaults.parts.indexOf('distribution') >= 0) {
    let imp = new ImportLocation({session, limit: defaults.count, logging})
    await imp.run(DbMySQL)
    await LoggingServer.info(`imported distribution`);
  }
  if (defaults.parts.indexOf('contact') >= 0) {
    let imp = new ImportContact({session, limit: defaults.count, logging})
    await imp.run(DbMySQL)
    await LoggingServer.info(`imported contact`);
  }
  if (output) {
    let filename = Helper.getFullPath(defaults.output, { rootKey: 'Path.logRoot'})
    const csvWriter = createCsvWriter({
      path: filename,
      header: [
        {id: 'status', title: 'Status'},
        {id: 'message', title: 'Message'},
        {id: 'action', title: 'Action'}
      ]
    });
    await csvWriter.writeRecords(output);
    await LoggingServer.info(`import:watsnext.end`)
    return [{status: 'info', message: `log written to ${filename}`}]
  }
  return results
}


async function init() {
  try {
    await DbMySQL.connect();
    await DbMongo.connect();
  } catch (e) {
    console.log(`[Error] starting db connection: ${e.message}`)
    throw e
  }
}
const debug = (msg) => {
  console.log(msg)
}
module.exports = {
  jobImportWatsNext
}
