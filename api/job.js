
process.env.NODE_ENV = 'develop';
process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
let options = {};
const say = (message) => {
  if (options && options.silent) {
    return;
  }
  console.log(message)
}

const LoggingServer = require('./lib/logging-server').loggingServer;

const sayImport = () => {
  say('version 0.3 dd 2023-02-02')
  say('global options:');
  say(' -s (silent) to stop the counters from displaying')

  say('import:wiki');
  say(' the information is sync between watsnext and mediakunst by using the csv file. Options:')
  say('  -f {name}  set the name of the file to import. Default dir /data')
  say('  -r reset/remove the existing wikipedia, setting only the once in the import file')
  say('  -d debug the process')
  say('')
  say('generate:wikipedia');
  say(' the wikipedia articles are retrieved and stored in mediakunst')
  say('  -d debug the process (default: 0)');
  say('  -t (template) the filename of the template')
  say('  -r (reset) force all biographies to be updated even if not changed')
  say('  -i (id) the watsnext id of the artist to import, if omitted all is imported');
  say('');
  say('import:watsnext');
  say(' import the watsnext database');
  say('  -c {number} the number of records to import');
  say('  -d debug the process (default: 0)');
  say('  -e {name} the email address of the user to use (default: watsnext@li-ma.nl)')
  say('  -i {number} record id to import. needs --parts to define table')
  say('  -o {filename} output the debug to this file')
  say('  -p {password} the password to use (default: 123456' );
  say('  -r --reset remove the existing records')
  say('  -v validate if the import did succeed')
  say('  --parts {comma seperated list of objects}. Values: art,agent,carrier,distribution,contact');
  say('');
  say('royalty:contact');
  say(' generate the xslx for a specific period.')
  say('  -i (id) the contact to scan')
  say('  -m {filename} write the mongodb query to filename')
  say('  -q {number} quarter')
  say('  -y {number} year (default current year')
  say('');
  say('royalty:contract');
  say(' list all contracts (dagstaten) with in a specific period as xslx.')
  say('  -y {number} year (default current year')
  say('  -q {number} quarter')
  say('  -i {number} the royalty contract')
  say('');
  say('examples')
  say('  node job import:watnext --parts contact -r -c 1000     => reimport all contacts')

  //say('  -p {names seperated by ,} the parts. Default all')
}

const sayError = (msg) => {
  console.log(`Error: ${msg}`)
}
const optionDefinitions = [
  { name: 'job', alias: 'j', type: String, defaultOption: true},
  { name: 'silent', alias: 's', type: Boolean},
  { name: 'help', alias: 'h', type: Boolean},
  { name: 'template', alias: 't', type: String},
  { name: 'file', alias: 'f', type: String},
  { name: 'reset', alias: 'r', type: Boolean},
  { name: 'debug', alias: 'd', type: Number},
  { name: 'id', alias: 'i', type: String},
  { name: 'email', alias: 'e', type: String},
  { name: 'password', alias: 'p', type: String},
  { name: 'count', alias: 'c', type: Number},
  { name: 'output', alias: 'o', type: String},
  { name: 'parts', type: String},
  { name: 'validate', alias: 'v', type: Boolean},
  { name: 'year', alias: 'y', type: Number},
  { name: 'quarter', alias: 'q', type: Number},
  { name: 'recalc', type: Boolean},
  { name: 'mongo', alias: 'm', type: String}
//   { name: 'env', alias: 'e', type: String},
]
const commandLineArgs = require('command-line-args')
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}


if (options.help || !options.job || typeof options.job !== 'string') {
  say('WatsNext Jobs\n');
  sayImport();
  return(0)
}

const util = require('util')
const {jobImportWatsNext: jobWatsNextImport} = require("./jobs/import-watsnext");
const {jobRoyaltyContact} = require("./jobs/royalties-per-contact");

switch (options.job) {
  case 'generate:wikipedia':
    const jobWikipedia = require('./jobs/generate.wikipedia').jobWikipedia
    util.promisify(jobWikipedia)

    LoggingServer.log('generate:wikipedia').then(async() => {
      jobWikipedia(options)
        .then(d => {
          say(`analysed ${d.length} artist, ${d.filter(x => x.action === 'changed').length} changed, ${d.filter(x => x.status === 'warning').length} warning, ${d.filter(x => x.status === 'error').length} errors`)
          if (options.debug) {
            console.log(d)
          }
          process.exit(0)
        }).catch(async e => {
          sayError(`wikipedia retrieve: ${e.message}`)
          await LoggingServer.error(e.message, e)
          process.exit(1)
        })
    });
    break;
  case 'import:wiki':
    const filename = options.file;
    if (!filename || ! filename.length) {
      sayError('filename is missing')
      process.exit(1)
    }
    const jobWikiImport = require('./jobs/import-wiki').jobImportWiki
    util.promisify(jobWikiImport)
    LoggingServer.info('import:wiki.start').then( () => {
      jobWikiImport(filename,{reset: options.reset, debug: options.debug}).then( async (x) => {
        say(`analysed ${x.length} records, ${x.filter(x => x.action === 'changed').length} changes,  ${x.filter(x => x.action === 'not found').length} not found`)
        say('data imported');
        await LoggingServer.info('import:wiki.ended')
        if (options.debug) {
          console.log(x)
        }
        process.exit(0)
      }).catch(async e => {
        sayError(`Import wiki links: ${e.message}`)
        await LoggingServer.error(e.message, {part: 'import:wiki'})
        process.exit(1)
      })
    })
    break;

  case 'import:watsnext': {
    const jobWatsNextImport = require('./jobs/import-watsnext').jobImportWatsNext;
    util.promisify(jobWatsNextImport);
    LoggingServer.info('import:watsnext.start').then(() => {
      jobWatsNextImport(options).then( async (x) => {
        // say(`imported ${x.length} records, ${x.filter(x => x.action === 'changed').length} changes,  ${x.filter(x => x.action === 'not found').length} not found`)
        if (options.validate) {
          console.log(x)
        } else {
          say('data imported');
        }
       await  LoggingServer.info('import:watsnext.ended')
        if (options.debug) {
          console.log(x)
        }

        process.exit(0)
      }).catch(async e => {
        sayError(`Import watsnext error: ${e.message}`)
        await LoggingServer.error(e.message)
        process.exit(1)
      })
    })
    break;
  }

  case 'royalty:contact': {
    const jobRoyaltyContact = require('./jobs/royalties-per-contact').jobRoyaltyContact
    util.promisify(jobRoyaltyContact);
    LoggingServer.info('royalty:contact').then(() => {
      jobRoyaltyContact(Object.assign({}, {recalc: true}, options)).then( async (x) => {
        // say(`imported ${x.length} records, ${x.filter(x => x.action === 'changed').length} changes,  ${x.filter(x => x.action === 'not found').length} not found`)
        if (x !== true) {
          console.log(x)
        }
        say('xslx generated');
        await  LoggingServer.info('royalty:contact.ended')
        if (options.debug) {
          console.log(x)
        }
        process.exit(0)
      }).catch(async e => {
        sayError(`royalty contact error: ${e.message}`)
        await LoggingServer.error(e.message)
        process.exit(1)
      })
    })
    break;
  }
  case 'royalty:contract': {
    const jobRoyaltyContract = require('./jobs/royalties-per-contact').jobRoyaltyContract
    util.promisify(jobRoyaltyContract);
    LoggingServer.info('royalty:contract').then(() => {
      jobRoyaltyContract(Object.assign({}, {recalc: true}, options)).then(async (result) => {
        // say(`imported ${x.length} records, ${x.filter(x => x.action === 'changed').length} changes,  ${x.filter(x => x.action === 'not found').length} not found`)
        say(`xslx generated (${result.filename})`);
        await LoggingServer.info('royalty:contract.ended')
        if (options.debug) {
          console.log(result.debugInfo)
        }
        process.exit(0)
      }).catch(async e => {
        sayError(`royalty contract error: ${e.message}`)
        await LoggingServer.error(e.message)
        process.exit(1)
      })
    })
    break;
  }
  default:
    sayError(`unknown job: "${options.job}"`)
    sayImport()
    process.exit(1)
}

