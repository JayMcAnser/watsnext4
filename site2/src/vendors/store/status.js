import { debug, error, error as errorReport, warn} from "../lib/logging";
import { apiState } from '../lib/const';

export const state = () => ({
  message: '',
  title: '',
  status: apiState.idle,
  leftDrawer: false,
  rightDrawer: false,
  bottomDrawer: false,
  actions: {},
  dialog: {
    name: '',
    mode: false,
    id: 0,
  },
  mode: {
    active: 'view'
  },
  menu: 'home'
})

export const mutations = {
  clear(state) {
    state.message = '';
    state.title = '';
    state.status = apiState.idle
    state.menu = 'home'
  },
  error(state, err) {
    errorReport(err.message, err.where)
    state.message = err.message;
    state.title = err.title;
    state.status = apiState.error
  },
  apiState(state, a) {
    state.status = a;
  },

  leftDrawer(state, show) {
    state.leftDrawer = !! show
  },
  rightDrawer(state, show) {
    state.rightDrawer = !! show
  },
  bottomDrawer(state, show) {
    state.bottomDrawer = !! show
  },

  toggleRightDrawer(state) {
    state.rightDrawer = !state.rightDrawer
  },
  dialog(state, show) {
    state.dialog = {
      name: show.name ? show.name : show.dialog,
      id: show.id === '' || !show.id || show.id === '0' || undefined ? false : show.id,
      mode: show.mode ? show.mode : undefined
    }
    debug(`dialog: ${state.dialog.name} on id: ${state.dialog.id}`, 'status.dialog')
  },
  mode(state, setup) {
    state.mode.active = setup.active;
    debug(`currentMode ${state.mode.active}`)
  },
  menu(state, part) {
    const MENUS = ['home', 'art']
    if (MENUS.indexOf(part) < 0) {
      warn(`unknown menu activated: ${part}`);
    } else {
      state.menu = part
    }
  }
}

export const actions = {
  async clear({commit}, user) {
    commit('clear')
  },
  async error({commit}, err) {
    commit('error', err)
  },
  async leftDrawer({commit}, show) {
    commit('leftDrawer', show)
  },
  async rightDrawer({commit}, show) {
    commit('rightDrawer', show)
  },
  async bottomDrawer({commit}, show) {
    if (show) {
      setTimeout(() => { // must delay to stop it from closing
        commit('bottomDrawer', show)
      }, 0)
    } else {
      commit('bottomDrawer', show)
    }
  },
  async toggleRightDrawer({commit}) {
    debug(`toggle right drawer`, 'status');
    commit('toggleRightDrawer');
  },
  async apiStatus({commit}, status) {
    commit('apiState', status)
  },
  dialog({commit}, status = false) {
    if (typeof status === 'string') {
      commit('dialog', {name: status, id: 0})
    } else if (typeof status === 'object') {
      commit('dialog', status)
    } else if (typeof status === 'boolean' || status === undefined) {
      commit('dialog', {name: '', id: 0})
    } else {
      warn(`unknonw dialog type ${JSON.stringify(status)}`)
    }
  },
  async checkAutoSave(context) {
    if (context.getters.isModeEdit) {
      // this can throw an error if it's not allowed or other things
      // console.log(context)
      debug('autosave', 'status.checkAutoSave')
      await context.dispatch('board/save', undefined, {root: true});
    }
  },
  async modeEdit(context) {
    return context.dispatch('checkAutoSave').then( () => {
      context.commit('mode', {active: 'edit'})
    });
  },
  async modeView(context) {
    return context.dispatch('checkAutoSave').then((x) => {
      debug('switch view', 'status.modeView')
      context.commit('mode', {active: 'view'})
    });
  },

  async menu({commit}, part) {
    try {
      commit('menu', part.menu);
    } catch (e) {
      error(e.message, 'status.menu')
    }
  }


}
export const getters = {
  hasError: (state) => { return state.status === 'error'},
  isOk: (state) => { return state.status === ''},
  errorMessage: (state) => { return state.message},
  isError: (state) => {return state.status === apiState.error},
  leftDrawer: (state) => { return state.leftDrawer},
  rightDrawer: (state) => { return state.rightDrawer},
  bottomDrawer: (state) => { return state.bottomDrawer},
  dialogName: (state) => state.dialog.name,
  dialogId: (state) => state.dialog.id,
  dialogMode: (state) => state.dialog.mode,
  isModeEdit: (state) => state.mode.active === 'edit',
  menuActive: (state) => (part) => state.menu === part,
}

export const status = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
