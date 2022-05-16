const Mongoose = require('../lib/db-mongo');
const Schema = Mongoose.Schema;
const Logging = require('../vendors/lib/logging');
const ModelHelper = require('./model-helper');
const Config = require('../lib/default-values');
const Const = require('../lib/const');
const Bookmark = require('./bookmark');
const Art = require('./art');
const Agent = require('./agent');


const MediakunstLayout = new Schema({
  bookId: Number,
  art: {
    type: Schema.ObjectId,
    ref: 'Art'
  },
  agent: {
    type: Schema.ObjectId,
    ref: 'Agent'
  },
});

let MediakunstSchema = new Schema(MediakunstLayout);
let MediakunstModel = Mongoose.Model('Mediakunst', MediakunstSchema);
module.exports = MediakunstModel;

/**
 * reimport the bookmark definition into the art and agent definition
 *
 * @return {Promise<void>}
 * @constructor
 */

const importData = async function(progress = function() {}) {
  try {
    // import the existing ones
    let artWorks = {};
    let activeArtWorks = await Art.find({isMediakunst: true});
    progress('msg', `${activeArtWorks.length} existing artworks`)
    for (let index = 0; index < activeArtWorks.length; index++) {
      artWorks[activeArtWorks[index]._id.toString()] = true;
    }
    activeArtWorks = null;

    let artists = {};
    let activeArtist = await Agent.find({isMediakunst: true});
    progress('msg', `${activeArtist.length} existing artists`)
    for (let index = 0; index < activeArtist.length; index++) {
      artists[activeArtist[index]._id.toString()] = true;
    }
    activeArtist = null;

    let result = {
      added: {
        artCnt: 0,
        agentCnt: 0,
      },
      removed: {
        artCnt: 0,
        agentCnt: 0
      },
      totals: {
        artCnt: 0,
        agentCnt: 0
      },
      errors: {
        artCnt : 0,
        artistCnt: 0
      }
    }
    let media = await Bookmark().Mediakunst();
    if (media.items && media.items.length) {
      progress('msg', 'processing artworks')
      progress('size', media.items.length)
      for (let index = 0; index < media.items.length; index++) {
      // for (let index = media.items.length - 1; index >= 0 ; index--) {
        try {
          progress('step', index)
          let art = await Art.findById(media.items[index].art);
          if (art) {
            if (!art.isMediakunst) {
              art.isMediakunst = true;
              art.mediakunstDate = new Date();
              await art.save();
              result.added.artCnt++;
            }
            result.totals.artCnt++
            let agent = await Agent.findById(art.creator)
            if (agent) {
              if (!agent.isMediakunst) {
                agent.isMediakunst = true
                await agent.save();
                result.added.agentCnt++;
              }
            } else {
              result.errors.agentCnt++
              Logging.log(`warn`, `missing agent ${art.creator} in artwork ${art._id} (${art.artId})`)
            }
            if (artists[art.creator.toString()]) {
              delete artists[art.creator.toString()];
            }
          } else {
            result.errors.artCnt++
            Logging.log('warn', `missing artworkd ${media.items[index].art} in bookmarklist`)
          }
          if (artWorks[art._id.toString()]) {  // remove it from our cached version
            delete artWorks[art._id.toString()]
          }
        } catch(e) {
          console.log(e);
          throw e
        }
      }
    }


    result.removed.artCnt = Object.keys(artWorks).length;
    progress('msg', `removing ${result.removed.artCnt} art links`)
    for (let key in artWorks) {
      if (!artWorks.hasOwnProperty(key)) { continue }
       let art = await Art.findById(key);
       if (art) {
         art.isMediakunst = false;
         await art.save();
       }
    }
    result.removed.artistCnt = Object.keys(artists).length;
    progress('msg', `removing ${result.removed.artistCnt} artists`)
    for (let key  in activeArtist) {
      if (!artists.hasOwnProperty(key)) {continue}
      let agent = await Agent.findById(key);
      if (agent) {
        agent.isMediakunst = false;
        await agent.save();
      }
    }

    return result;
  } catch(e) {
    Logging.log('error', `error ${e.message}`, 'mediakunst.ImportData');
    throw e
  }
}

/**
 * retrieve the count of the records an other information
 * @return {Promise<{artCount: number, artistCount: number, lastRefresh: string}>}
 * @constructor
 */
const MediakunstStats = async function() {
  let artCount = await Art.find({isMediakunst: true}).countDocuments();
  let artistCount = await Agent.distinct({isMediakunst: true}).countDocuments();
  return {
    artistCount: artistCount,
    artCount: artCount,
    lastRefresh: Date()
  }
}


module.exports.stats = MediakunstStats;
module.exports.importData = importData;
