

import { debug, warn, newError} from "../vendors/lib/logging";
import * as db from '../models/database';
// import Board from '../models/board';

export const state = () => ({
  database: {},
  board: {},
  layout: false
})

export const mutations = {
  increment(state) {

  },
  dbLoad(state) {
//    if (!Object.keys(state.database).length) {
    if (!state.database || !state.database.isLoaded) {
//      debug('connect database', 'store.board.initDb')
      debug('board.db has been reset', 'store.board.dbLoad')
      state.database = new db.Database()
    } else {
      console.log('db remain')
    }
  },
  dbReload(state) {
    if (!state.database || !state.database.isLoaded) {
      state.database = new db.Database()
    }
    state.database.reload()
  },

  activate(state, id) {
    state.board = state.database.boardById(id)
  }
}

export const actions = {
  increment(context) {
    context.commit('increment')
  },

  async reloadDb({state, commit}) {
    debug('reload', 'store.board.reloadDb')
    commit('dbReload');
  },
  async initDb({state, commit, dispatch}) {
    debug('load', 'store.board.initDb')
    await dispatch('auth/registerEvent', {name: 'initdb.logout', action: 'logout', call: 'board/reloadDb'}, {root: true})
    await dispatch('auth/registerEvent', {name: 'initdb.login', action: 'login', call: 'board/reloadDb'}, {root: true})
    commit('dbLoad');
    //return Promise.resolve()
  },

  async list({state, commit, dispatch}) {
    try {
      await dispatch('initDb')
      return await state.database.boards()
    } catch (e) {
      dispatch('status/error', newError(e, 'store.board.list'), {root: true})
      throw new Error(e.message)
    }
  },
  async create({state, commit, dispatch}, data) {
    try {
      await dispatch('status/clear', undefined, {root: true})
      await dispatch('initDb')
      state.board = await state.database.boardNew();
      debug(state.board.id,'board.create')
    } catch (e) {
      await dispatch('status/error', e, {root: true});
      throw e
    }
  },


  async save({state, dispatch}) {
    if (state.board) {
      await dispatch('status/clear', undefined, {root: true})
      try {
        await state.board.save();
      } catch (e) {
        await dispatch('status/error', e, {root: true});
        throw e
      }
    }
  },
  async cancel({state}) {
    if (state.board) {
      await dispatch('status/clear', undefined, {root: true});
      try {
        await state.board.cancel();
      } catch (e) {
        await dispatch('status/error', e, {root: true});
      }
    }
  },

  async remove(context, data) {
    await context.dispatch('status/clear', undefined, {root: true});
    try {
      debug(data, 'board.remove')
      await context.state.board.elementDelete(data);
      await context.state.board.save()
    } catch (e) {
      await context.dispatch('status/error', e, {root: true});
    }
  },

  async createElement(context, data) {
    await context.dispatch('status/clear', undefined, {root: true})
    debug(context.state.board, 'createElement')
    return await context.state.board.elementCreate(data);
  },

  async activate({state, commit, dispatch}, data) {
    if (!Object.keys(state.board).length || state.board.id !== data.id) {
      await dispatch('initDb')
      state.board = await state.database.boardById(data.id);
      //state.layout = state.board.inventory
      debug(data.id, 'board.active')
    }
  },

  async layout(context, data) {
    if (Object.keys(context.state.board).length) {
      await context.dispatch('initDb')
    }
    if (data && context.state.board.elements.get(data.id)) {
      context.state.layout = context.state.board.elements.get(data.id);
      debug(context.state.layout.id, 'board.layout')
    } else {
      if (data) debug(`can not find ${context.state.layout.id}`, 'board.layout')
      context.state.layout = false
    }
  }
}

export const getters = {
  data: (state) => {
    return state.elementClass;
  },
  active: (state) => {
    return state.board;
  },
  inventory: (state) => {
    return state.board.inventory
  },
  layout: (state) => {
    return state.layout
  },
  list: (state) => {
    if (state.database.isLoaded) {
      return state.database.boards()
    }
    return []
  }

}


export const board = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
