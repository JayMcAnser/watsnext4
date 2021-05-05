
const Config = require('config');
const Message = require('./lib/const');

/**
 * filter only the image to be uploaded
 * @param req
 * @param file
 * @param cb
 * @returns {*}
 *
 * see: https://stackabuse.com/handling-file-uploads-in-node-js-with-expres-and-multer/
 */
const imageFilter = function(req, file, cb) {
  let orgName = file.toUpperCase();
  let regEx = new RegExp(Config.get('UploadFilter.image'));
  if (!orgName.match(regEx)) {
    req.fileValidationError = Message.errors.onlyImages;
    return cb(new Error(req.fileValidationError), false);
  }
  cb(null, true)
}

exports.imageFilter = imageFilter

