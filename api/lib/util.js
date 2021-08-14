/**
 *
 */

const Mongoose = require('mongoose');


module.exports.QuerySession = function() {
  Mongoose.Query.prototype.session = function(session, aCallback) {
    //console.log(this);
    // let query = this;
    // return query.run(aError, aDocs) {
    //   if (aError) {
    //
    //   }
    // }
    if (aCallback) {
      return aCallback(null);
    }
    return this;
  }
}

module.exports.replaceAll = (str, oldVal, newVal) => {
  return str.split(oldVal).join(newVal)
}

module.exports.isNumeric = (str) => {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
