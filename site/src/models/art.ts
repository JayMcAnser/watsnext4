/**
 * art related definitions
 */

import {Dataset, IDatasetOptions} from "./dataset";


export class ArtModel extends Dataset {

  constructor(options: IDatasetOptions) {
    super(Object.assign({}, options, {modelName: 'art'}));
  }
}
