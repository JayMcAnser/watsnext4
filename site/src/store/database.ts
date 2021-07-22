/**
 * Database store
 *
 */

import { debug, warn, error } from '../vendors/lib/logging';
import {Database} from "../lib/database";
import {SearchDefinition} from "../lib/search-definition";
import {IQueryResult} from "../models/dataset";

interface IDatabaseStore {
  db: Database
}

interface IQuery {
  modelName: string,
  searchDefinition: SearchDefinition
}

export const state  = () : IDatabaseStore => ({
  db: new Database()
})



export const mutations = {
  /**
   *
   * @param state
   * @param info Object { format, data}
   */
  LIST(state, info) {
    if (!info.format || info.format.length === 0) { info.format = 'default'}

  //  state.artList = data;
  }
}


export const actions = {
  increment(context) {
    context.commit('increment')
  },
  async query({getters}, query: IQuery) {
    let table = getters.table(query.modelName);
    return await table.query(query.searchDefinition);
  },

  unlink({getters}, query: IQueryResult) {
    query.unlink()
  }
}


export const getters = {
  table: (state: IDatabaseStore) => (modelName) => {
    return state.db.table(modelName)
  }
}

export const database = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
