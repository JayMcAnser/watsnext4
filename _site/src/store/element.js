
import { axiosActions } from '../vendors/lib/const';
import { debug, warn, error, ValidationError } from '../vendors/lib/logging';
import Axios from '../vendors/lib/axios';
import {apiState} from '../vendors/lib/const';
import Factory from '../lib/factory';
import {newError} from '../vendors/lib/logging'

export const state = () => ({
  elementClass: {}
})

export const mutations = {
  increment(state) {

  },
  setElement(state, element) {
    state.elementClass = Factory(element)
    debug(JSON.stringify(state.elementClass), 'store.element.setElement')
  }
}


export const actions = {
  increment(context) {
    context.commit('increment')
  },

  async activate({commit, dispatch, rootGetters}, elmDef) {
    const LOC = 'store.element.activate';
    await dispatch('status/clear', '', {root: true});
    let elm = rootGetters['board/element'](elmDef.id)

    commit('setElement', elm);
  },

  /**
   * add / saves update an element on the curent board
   * @param {Object} element
   */
  async save({commit, dispatch, getters, rootGetters}, element) {
    // ----
    // this.$store.getters['board/element'](rec.id).title = rec.title

    debug(rootGetters['board/element'](element.id), 'pre-result')
    let x = rootGetters['board/element'](element.id)
    Object.assign(x, element);
    x.test ='123'
    // await dispatch('board/setElement', element, {root: true})
    debug(rootGetters['board/element'](element.id), 'post-result')
    return true
    let boardOrg = rootGetters['board/active']
    boardOrg.elements[element.id].title = element.title
    debug(boardOrg.elements[element.id], 'result')

    // ----


    const LOC = 'store.element.save'
    try {
      const LOC = 'store.element.update';
      await dispatch('status/clear', '', {root: true});

      let boardId = rootGetters['board/id'];
      let boardOrg = rootGetters['board/active']
      let elm = element.isClass ? element : Factory(element);
      if (!elm.isValid()) {
        throw new ValidationError('element not valid', elm.ValidationErrors, LOC)
      }
      let result;
      if (elm.isNew) {
        result = await Axios.post(`board/${boardId}/element`, elm.storeData)
      } else {
        result = await Axios.patch(`board/${boardId}/element/${elm.id}`, elm.storeData)
      }
      if (axiosActions.isOk(result)) {
        let board = axiosActions.data(result)
        boardOrg.elements[element.id].title = element.title
        debug(boardOrg.elements[element.id], 'result')
        // update the entire board ...
        // await dispatch('board/setBoard', board, {root: true});
        // let elmData = rootGetters['board/element'](elm.id)
        // commit('setElement', elmData);
        return true
      }
      dispatch('status/error', newError(axiosActions.errors(result), LOC), {root: true})
      return false;
    } catch(e) {
      dispatch('status/error', newError(e, LOC + '.catch'), {root: true})
      throw e;
    }
  }

}


export const getters = {
  data: (state) => {
    return state.elementClass;
  },
  class: (state, rootGetters) => (id) => {
    let elm = rootGetters['board/element'](id)
    return Factory(elm)
  }
}

export const element = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
