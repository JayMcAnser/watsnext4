import { debug, error, error as errorReport, warn} from "../lib/logging";
import { apiState } from '../lib/const';

const RIGHTS_VIEW = 1;
const RIGHTS_EDIT = 2;

export const state = () => ({
  isAuthenticated: false,
  email: '',
  username: '',
  access: {},  // {contact: 1 + 2 }
})

export const mutations = {
  login(state, user) {
    try {
      state.isAuthenticated = true
      state.email = user.email;
      state.name = user.name
      state.access = {};
      if (user.rights) {
        for (let index = 0; index < user.rights.length; index++) {
          let m = user.rights[index]
          if (m.rights === user || m.module === undefined) {
            warn(`rights[${index}] is missing module or rights`);
            continue;
          }
          if (state.access.hasOwnProperty(m.module)) {
            warn(`duplicate in rights (${m.module}), replacing with newer value `)
          }
          state.access[m.module] = m.rights;
          let keys = m.module.split('.')
          if (keys.length > 1) {
            if (state.access[keys[0]]) {
              state.access[key[0]] = state.access[key[0]] | user.rights[keys[0]]
            } else {
              state.access[key[0]] = user.rights[keys[0]]
            }
          }
        }
      } else {
        warn('the rights are not set for this user.')
      }
      debug(`user: ${state.email}, rights:, ${JSON.stringify(state.access)}`)
    } catch (e) {
      error(e.message, 'user.login')
    }
  },
  logout(state) {
    state.isAuthenticated = false;
    state.access = {};
    state.email = '';
    state.username = '';
  }

}

export const actions = {
  async init({commit, dispatch}, user) {
    // setup the listeners for that login / logout
    await dispatch('auth/registerEvent', {name: 'userLogin', call: 'user/login', action: 'login' }, {root: true})
    await dispatch('auth/registerEvent', {name: 'userLogout', call: 'user/logout', action: 'logout' }, { root: true})
    // commit('login', user)
  },

  async login({commit}, user) {
    console.log('WHAT', user)
    debug('user login', 'store.user.login')
    commit('login', user)
  },
  async logout({commit}) {
    debug('user logout', 'store.user.logout')
    commit('logout')
  }
}
export const getters = {
  isAuthenticated: (state) => { return state.isAuthenticated },
  name: (state) => { return state.isAuthenticated ? state.name : 'no name'},
  email: (state) => { return state.isAuthenticated ? state.email : undefined },
  rightsView: (state) => (part) => {
    // everybody can see home and admin can see everything
    if (part === 'home' || state.access.system) {
      return true;
    }
    return !! (state.access[part] && (state.access[part] & RIGHTS_VIEW  === RIGHTS_VIEW))
  },
  rightsEdit: (state)=> (part) => {
    return state.access[part] && (state.access[part] & RIGHTS_EDIT  === RIGHTS_EDIT)
  }
}

export const user = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
