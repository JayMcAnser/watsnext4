import { ISearchDefinition } from "./search-definition";
import Axios from "../vendors/lib/axios";
import {axiosActions} from "../vendors/lib/const";
import {warn, debug} from '../vendors/lib/logging';


export interface IApiServerOptions {
  [index: string]: any
}
/**
 * ApiServer
 *
 * connector for the api
 * version 0.0.1  Jay, 2021-07-06
 */

export interface IApiQueryResult {
  [index: number]: any,
  length: number
}
export interface IQueryRecord {
  [index: string]: any
}

export class ApiServer {
 // private server: string
  private axios: IApiServerOptions;

  constructor(options : IApiServerOptions = {})
  {
    // this.server = options.server ? options.server : Axios.server
    this.axios = options.axios ? options.axios : Axios;
    if (options.hasOwnProperty('logging')) {
      this.axios.logToConsole(options.logging)
    }
  }

  logToConsole(state: boolean) {
    this.axios.logToConsole(state)
  }

  get isMock() : boolean {
    return false;
  }
  get server() : string {
    return this.axios.server
  }
  get api() {
    return this.axios
  }
  get url() : string {
    return this.server
  }
  get port() : number {
    let parts = this.server.split(':');
    if (parts.length !== 3) {
      return 3050
    } else {
      let splits = parts[2].split('/')
      return +splits[0]
    }
  }

  /**
   * retrieve the current server info record
   */
  async getInfo() : Promise<any> {
    return this.axios.get('info');
  }
  /**
   * retrieve records byt a query
   * @param model String the name of the model
   * @param query SearchDefinition the definition of the search
   * @return Promise<Array[data]>
   */
  async getByQuery(model: string, query: ISearchDefinition) : Promise<IApiQueryResult> {
    // we must request the searchDef.query from the API
    try {
      debug(`model: ${model}, search for: ${query.value}`, 'api-server.getByQuery')
      let searchResult = await this.axios.get(`${model}`, {params: query.toQuery()});
      if (axiosActions.hasErrors(searchResult)) {
        // await dispatch('auth/logout', undefined,{root: true})
        throw new Error(axiosActions.errorMessage(searchResult))
      } else {
        return axiosActions.data(searchResult)
      }
    } catch(e) {
      warn(`api.byQuery.${model}: ${e.message}`)
     //  console.error((e.message))
      throw e;
    }
  }

  /**
   * retrieve one record from the api
   * @param model String
   * @param id String
   * @return {Promise<Object>}
   */
  async getById(model: string, id: string): Promise<IQueryRecord | false> {
    let searchResult = await Axios.get(`/${model}/id/${id}`);
    if (axiosActions.hasErrors(searchResult)) {
      throw new Error(axiosActions.errorMessage(searchResult))
    } else {
      let rec =  axiosActions.data(searchResult);
      if (Array.isArray(rec) && rec.length ) {
        return rec[0]
      }
      return false;
    }
  }
}
