const Config = require('config')
const Fs = require('fs');
const Helper = require('../vendors/lib/helper')


const randomImage = function(type) {
  let mask = Config.get(`Board.media${type}`);
  let dirName = Helper.getFullPath('', {rootKey: 'Path.mediaRoot'});
  if (Fs.existsSync(dirName)) {
    let files = Fs.readdirSync(dirName);
    files = files.filter((f) => f.indexOf(mask) >= 0)
    let index = Math.floor(Math.random() * files.length);
    return files[index]
  }
  return false;
}


module.exports = {
  randomImage
}
