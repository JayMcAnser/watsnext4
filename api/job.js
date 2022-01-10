process.env["NODE_CONFIG_DIR"] = __dirname + '/../config/';
let options = {};
const say = (message) => {
  if (options && options.silent) {
    return;
  }
  console.log(message)
}

const sayUsage = () => {
  say('running jobs to import info from mediakunst and wikipedia')
  say('version 0.1 dd 2021-12-10')
  say('\ncommand to run:  node job.js [action]')
  say('where action can be: ')
  say('  wikipedia - the information is sync between watsnext, wikipedia and mediakunst')
  say('  import - import data into the db')
}

const sayImport = () => {
  say('import.wiki options (-t import)');
  say('  -f {name}  set the name of the file to import. Default dir /data')
  say('  -r reset/remove the existing wikipedia, setting only the once in the import file')
  say('  -d debug the process')
  say('wikipedia options (-t wikipedia');
  say('  -d debug the process (default: 0)');
  say('  -t (template) the filename of the template')
  say('  -i (id) the watsnext id of the artist to import')
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
  { name: 'debug', alias: 'd', type: Boolean},
  { name: 'id', alias: 'i', type: String},
//   { name: 'env', alias: 'e', type: String},
]
const commandLineArgs = require('command-line-args')
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}

say('WatsNext Jobs\n');
if (options.help || !options.job || typeof options.job !== 'string') {
  sayUsage();
  return(0)
}

const util = require('util')

switch (options.job) {
  case 'wikipedia':
    const jobWikipedia = require('./jobs/wikipedia').jobWikipedia
    util.promisify(jobWikipedia)

    jobWikipedia({debug: options.debug, template: options.template, id: options.id})
      .then(d => {
        say(`analysed ${d.length} artist, ${d.filter(x => x.action === 'changed').length} changed, ${d.filter(x => x.status === 'error').length} errors`)
        if (options.debug) {
          console.log(d)
        }
        process.exit(0)
      }).catch(e => {
      sayError(`wikipedia retrieve: ${e.message}`)
      process.exit(1)
    })
    break;
  case 'import.wiki':
    const filename = options.file;
    if (!filename || ! filename.length) {
      sayError('filename is missing')
      process.exit(1)
    }
    const jobWikiImport = require('./jobs/import-wiki').jobImportWiki
    util.promisify(jobWikiImport)
    jobWikiImport(filename,{reset: options.reset, debug: options.debug}).then( (x) => {
      say(`analysed ${x.length} records, ${x.filter(x => x.action === 'changed').length} changes,  ${x.filter(x => x.action === 'not found').length} not found`)
      say('data imported');
      if (options.debug) {
        console.log(x)
      }
      process.exit(0)
    }).catch(e => {
      sayError(`Import wiki links: ${e.message}`)
      process.exit(1)
    })
    break;
  default:
    sayError(`unknown job: "${options.job}"`)
    sayUsage()
    process.exit(1)
}

