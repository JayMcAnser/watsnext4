/**
 * menu store
 *
 */
import {error} from '../vendors/lib/logging'

// the menu and the submenus and who can see them
const VALID_STATES = {
  home: {
    default: ['all']
  },
  distribution: {
    default: ['all']
  }
}

export const state = () => ({
  active: 'home',
  subMenu: 'default'
})


export const mutations = {
  active({status}, active) {
    if (VALID_STATES.hasOwnProperty(active)) {
      if (VALID_STATES[active].default.indexOf())
      status.active = active;
      this.state.subMenu = 'default'
    } else {
      error(`[store.menu] unknown state: ${active}`)
    }
  }
}


export const actions = {
  distribution(context) {
    context.commit('active', 'distribution')
  },
  increment(context) {
    context.commit('increment')
  }
}


export const getters = {

  active: (state) => {
    return 'THIS IS IT'; // state.active
  }
  //
  // data: (state) => {
  //   return state.elementClass;
  // }
}

export const menu = {
  state,
  mutations,
  actions,
  getters
}
