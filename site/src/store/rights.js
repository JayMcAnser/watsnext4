/**
 * rights store
 *
 */
import {debug, error} from '../vendors/lib/logging'

const RIGHTS_OWNER = 1;
const RIGHTS_READ = 2;
const RIGHTS_WRITE = 4;
const RIGHTS_ACCESS = 8;
const RIGHTS_PUBLIC = 16;

export const state = () => ({
  art: 0,
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

  canEdit: (state) => (modelName) => {
    return state.hasOwnProperty(modelName) && (state.modelName & RIGHTS_READ === RIGHTS_READ)
  },
  active: (state) => {
    return state.menu
  }

}

export const rights = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
