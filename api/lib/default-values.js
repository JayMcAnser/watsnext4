/**
 * retrieving default values
 *
 * Jay 2020-10-04
 */

const Config = require('config');

const Default = {
  'royalties.agent.percentage': 60,                // default percentage a artis gets
  'doc.menu': '[Home](http://localhost:3000/doc/)',
  'doc.rootUrl': 'http://localhost:3000/doc/'

}
/**
 *
 * @param key String - a multi level string like: distribution.art.name
 * @param defaultValue - the value if the key is not found
 */
const getValue = (key, defaultValue) => {
  if (Default.hasOwnProperty(key)) {
    return Default[key]
  } else {
    return defaultValue
  }
}

module.exports.value = getValue;

module.exports.royaltiesArtPercentage = 'royalties.art.percentage'
