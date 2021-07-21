import { SearchDefinition } from "./search-definition";
import Axios from "../vendors/lib/axios";
import {axiosActions} from "../vendors/lib/const";


export interface IApiServerOptions {
  server? : string
}
/**
 * ApiServer
 *
 * connector for the api
 * version 0.0.1  Jay, 2021-07-06
 */

export class ApiServer {
  private server: string

  constructor(options : IApiServerOptions = {})
  {
    this.server = options.server ? options.server : '/'
  }

  /**
   * retrieve records byt a query
   * @param model String the name of the model
   * @param query SearchDefinition the definition of the search
   * @return Promise<Array[data]>
   */
  async getByQuery(model: string, query: SearchDefinition) {
    // we must request the searchDef.query from the API
    let searchResult = await Axios.get(`/${model}`,{params: query.toQuery()});
    if (axiosActions.hasErrors(searchResult)) {
      // await dispatch('auth/logout', undefined,{root: true})
      throw new Error(axiosActions.errorMessage(searchResult))
    } else {
      return axiosActions.data(searchResult)
    }
  }

  /**
   * retrieve one record from the api
   * @param model String
   * @param id String
   * @return {Promise<Object>}
   */
  async getById(model: string, id: string) {
    let searchResult = await Axios.get(`/${model}/id/${id}`);
    if (axiosActions.hasErrors(searchResult)) {
      throw new Error(axiosActions.errorMessage(searchResult))
    } else {
      let rec =  axiosActions.data(searchResult);
      if (Array.isArray(rec)) {
        return rec[0]
      }
      return rec
    }
  }
}
