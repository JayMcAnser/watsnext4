/**
 * art store
 *
 */

import { axiosActions } from '../vendors/lib/const';
import Axios from '../vendors/lib/axios';
import { debug, warn, error } from '../vendors/lib/logging';

export const state = () => ({
  artList: {}
})



export const mutations = {
  /**
   *
   * @param state
   * @param info Object { format, data}
   */
  LIST(state, info) {
    if (!info.format || info.format.length === 0) { info.format = 'default'}

    state.artList = data;
  }
}


export const actions = {
  increment(context) {
    context.commit('increment')
  },
  async list({dispatch, commit}, {filter}) {
    try {
      // clear any login errors
      await dispatch('status/clear', undefined, {root: true})
      // this can return different formats...
      // so how to handle a list format and an edit format??
      let result = await Axios.get('/art', filter)
      if (axiosActions.hasErrors(result)) {
        // await dispatch('auth/logout', undefined,{root: true})
        throw new Error(axiosActions.errorMessage(result))
      } else {
        commit('LIST', {format: filter.view, data: axiosActions.data(result)});
        return true;
      }
    } catch( err) {
      throw new Error(err.message)
    }
  }
}


export const getters = {
  data: (state) => {
    return state.elementClass;
  },
  items: (state) => (part) => {
    return []
  }
}

export const art = {
  state,
  mutations,
  actions,
  getters
}
