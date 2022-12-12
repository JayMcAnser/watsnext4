
const optionDefinitions = [
  { name: 'module', alias: 'm', type: String, defaultOption: true},
  { name: 'silent', alias: 's', type: Boolean },
  { name: 'help', alias: 'h', type: Boolean },


]

const commandLineArgs = require('command-line-args')
const util = require('util');
const {reject} = require("lodash");
let options;
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}

const say = function(msg) {
  if (!options.silent) {
    console.log(msg)
  }
}
if (options.help) {
  console.log('usage: node watsnext.js {module} [args]')
  console.log('options:');
  console.log(' -m module - the module to load')
  console.log(' -h (help) this page')
  console.log(' -s (silent) do not display any message (default: 0)')
  process.exit(0)
}

let runModule = async () => {
  let module = require('./commands/' + options.module)
  if (module && module.class) {
    let cmdClass = module.class;
    let cmd = new cmdClass(options);
    try {
      await cmd.run()
    } catch (e) {
      console.error(e)
    }
  } else {
    console.error('missing module')
  }
  return reject('not')
}
util.promisify(runModule)
runModule()
  .then( () => {
    console.log('done')
  })
  .catch( (e) => {
    console.error(e)
  })
