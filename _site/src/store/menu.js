/**
 * menu store
 *
 */
import {debug, error} from '../vendors/lib/logging'

export const state = () => ({
  menu: ['home']
})


export const mutations = {
  active(state, active) {
    state.menu = active.split('/')
    debug(`active menu: ${state.menu.join('.')}`)
  }
}


export const actions = {
  /**
   * activate the menu with a art/list/xx string
   * @param contect
   * @param menuString
   */
  activate(context, menuString) {
    if (!menuString) {
      menuString = 'home'
    }
    context.commit('active', menuString)
  }
}


export const getters = {

  active: (state) => {
    return state.menu
  }

}

export const menu = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
