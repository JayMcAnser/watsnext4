/**
 * Data buffer
 * version 0.0.1 Jay 02-07-2021
 *
 * The data buffer is the connector between the data and the api
 * It retrieves the information from the api, stores this (temporary) until no longer used
 *
 */

import Axios from '../vendors/lib/axios';
import { axiosActions } from '../vendors/lib/const';

class DataBuffer {
  private url: string
  private buffer: Map<String, Object>;

  constructor(options  = {url: undefined}) {
    this.url = options.url;  // the /art or /distribution
    this.buffer = new Map();
  }

  /**
   * retrieve one record from the api
   *
   * @throws NotFound
   * @param id
   */
  async getData(id) : Promise<Object> {
    if (this.buffer.has(id)) {
      return this.buffer.get(id)
    } else {
      // retrieve the data from the api
      let result = await Axios.get(`/art/id/${id}`)
      if (axiosActions.hasErrors(result)) {
        throw new Error(axiosActions.errorMessage(result))
      } else {
        // commit('get by id', {format: filter.view, data: axiosActions.data(result)});
        return true;
      }
    }
  }

}

export default DataBuffer;
