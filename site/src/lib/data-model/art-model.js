/**
 * art model
 *
 * version 0.0.1
 */

const DataModel = require('../data-model');

class ArtModel extends DataModel {
  constructor(options = {}) {
    // fields is not really used

    options.fields = ['artId', 'type', 'searchcode', 'title']; // more to follow
    options.table = 'art'
    super(options);
  }

  clear() {
    super.clear();
    this._artist = false
  }
  toModel(data) {
    super.toModel(data);
  }

  get artist() {
    if (this._artist) {
      return this._artist.value
    }
    // load info from an other definition
    this._artist = {
      value: 'get the artist'
    };
    return this._artist.value
  }

  set artistId(artistId) {
    // do what we ant
  }

}

export default ArtModel
