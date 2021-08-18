/**
 * art related definitions
 */

import {Model, IModelOptions} from "./model";


export class ArtModel extends Model {

  constructor(options: IModelOptions) {
    super(Object.assign({}, options, {modelName: 'art'}));
  }

}
