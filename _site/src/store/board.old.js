
import { axiosActions } from '../vendors/lib/const';
import { debug, warn, error, newError } from '../vendors/lib/logging';
import Axios, { setHeaders } from '../vendors/lib/axios';
import {apiState} from '../vendors/lib/const';
import Vue from 'vue';

// import {Headers} from '../vendors/lib/axios';

const isNew = (data) => {
  return data.id === undefined
}
export const state = () => ({
  activeColumnIndex: 0,
  boards: [],
  activeBoardIndex: -1,
  // the id holding element entry that defined the display columns
  columnsId: '',
  counter: 0
})

const _copyField = function(source, dest, hiddenFields = false) {
  if (!hiddenFields) {
    hiddenFields = ['id', '_isNew']
  } else if (Array.isArray(hiddenFields)) {
    hiddenFields = [hiddenFields]
  }

  for (let fieldname in source) {
    if (hiddenFields.indexOf(fieldname) < 0) {
      dest[fieldname] = source[fieldname]
    }
  }
  return dest;
}

export const mutations = {
  increment(state) {
    state.counter++
  },
  activeColumnIndex(state, index) {
    state.activeColumnIndex = index
  },
  /**
   * update the full list of all boards
   * @param {} state
   * @param {*} boards
   */
  setBoards(state, boards) {
    // todo: it should not replace is but merge is.
    // because it just takes more time
    state.boards = boards
  },
  /**
   * update one board to the full list
   * returns index or false if not found
   */
  setBoard(state, board) {
    let index = state.boards.findIndex( (b) => b.id === board.id);
    if (index < 0) {
      error(`board ${board.id} not found`)
      state.activeBoardIndex = -1
      return false;
    }
    _copyField(board, state.boards[index]);
    // state.boards[index] = board;
    return index
  },
  addBoard(state, board) {
    let index = state.boards.findIndex( (b) => b.id === board.id);
    if (index < 0) {
      state.boards.push(board);
      return state.boards.length - 1
    }
    return index
  },

  activateBoard(state, board) {
    let index = state.boards.findIndex( (b) => b.id === board.id);
    if (index !== false) {
      if (state.activeBoardIndex !== index) {
        // only change the active index if it changes
        state.activeColumnIndex = 0;
        state.columnsId = '';
        for (let id in board.elements) {
          // todo we could choose the view here
          if (board.elements[id].type === 'board') {
            state.columnsId = id;
            debug(`column:  ${JSON.stringify(board.elements[id])}`, 'state')
            break;
          }
        }
        state.activeBoardIndex = index
      }
    }
  },
  clearCache(state) {
    state.boards = [];
    state.activeBoardIndex = -1;
    state.activeColumnIndex = 0;
    state.columnsId = '';
    debug(`clearCache done ${state.boards.length} boards`)
  }
}

const generateHeaders = (rootGetters) => {
  return  {
    headers: Headers(rootGetters['auth/authHeader'])
  }
}

export const actions = {
  increment(context) {
    context.commit('increment')
  },

  /**
   * list all information from one board
   */
  async list({commit, dispatch, getters}) {
    const FUN = 'store.board.load'
    await dispatch('status/clear', '', {root: true})
    if (getters.boards.length) {
      // do not reload the board list if not needed
      // if we do, the column(s) getters can return empty values
      // because the columns are not yet loaded.
      debug(`serving from cache ${getters.boards.length} items`, FUN)
      return getters.boards
    }
    try {
      debug(`loading from server`, FUN)
      let res = await Axios.get('/board/list');
      if (axiosActions.isOk(res)) {
        commit('setBoards', axiosActions.data(res));
        commit('activeColumnIndex', 0)
        dispatch('auth/registerEvent', {name: 'boardList', action: ['logout', 'login'], call: 'board/reset'}, {root: true})
        return getters.boards;
      }
      let err = newError(axiosActions.errors(res), FUN)
      dispatch('status/error', err, {root: true})
      throw err;
    } catch (e) {
      dispatch('status/error', newError(e, FUN), {root: true})
      throw new Error(e.message)
    }
  },


  /**
   * defines the current board by setting the id
   * @param {*} data Object: {id}
   */
  async activate({commit, dispatch, getters}, data) {
    const FUN = 'store.board.activate'
    await dispatch('status/clear', '', {root: true})
    try {
      let url = `/board/${data.id}`
      debug(`activate board ${url}`)
      await dispatch('status/apiStatus', apiState.waiting, {root: true})
      let res = await Axios.get(url);
      if (axiosActions.isOk(res)) {
        await dispatch('status/apiStatus', apiState.ready, {root: true})
        // debug(`found it ${JSON.stringify(res)}`)
        commit('setBoard', axiosActions.data(res));
        commit('activateBoard', axiosActions.data(res))
        return getters.active;
      } else if (axiosActions.hasErrors(res)) {
        let err = newError(axiosActions.errors(res), FUN)
        dispatch('status/error', err, {root: true})
      } else {
        warn(axiosActions.data(res), FUN)
        return axiosActions.data(res)
      }
    } catch(e) {
      dispatch('status/error', newError(e, FUN), {root: true})
      throw e;
    }
  },

  async open({commit, dispatch}, data) {
    const FUN = 'store.board.open';
    await dispatch('status/clear', '', {root: true});
    try {

      let url = `/board/${data.id}`
      let res = await Axios.get(url);
      if (axiosActions.isOk(res)) {
        await dispatch('status/apiStatus', apiState.ready, {root: true})
        commit('setBoard', axiosActions.data(res));
        return axiosActions.data(res)
      } else if (axiosActions.hasErrors(res)) {
        let err = newError(axiosActions.errors(res), FUN)
        dispatch('status/error', err, {root: true})
        return false;
      } else {
        warn(axiosActions.data(res), FUN)
        return axiosActions.data(res); //?????
      }
    } catch(e) {
      dispatch('status/error', newError(e, FUN), {root: true})
      throw e;
    }
  },

  async save({commit, dispatch, rootGetters}, data) {
    const LOC = 'store.board.save';
    await dispatch('status/clear', '', {root: true});
    let result;
    try {
      // Headers(rootGetters['auth/token'])
      debug(data,LOC)
      if (isNew(data)) {
        result = await Axios.post('board', data);
        if (axiosActions.isOk(result)) {
          let board = axiosActions.data(result);
          debug(`create board id: ${board.id}`)
          // await dispatch('board/open', {dataid},  {root: true})
          commit('addBoard', board)
          commit('activateBoard', board);
          await dispatch('status/apiStatus', apiState.ready, {root: true})
          return true
        }
      } else {
        result = await Axios.patch(`board/${data.id}`, data)
        if (axiosActions.isOk(result)) {
          let board = axiosActions.data(result)
          commit('setBoard', board);
          commit('activateBoard', board);
          await dispatch('status/apiStatus', apiState.ready, {root: true})
          return true
        }
      }
      let err = newError(axiosActions.errors(result), LOC)
      dispatch('status/error', err, {root: true})
      return false;
    } catch(e) {
      dispatch('status/error', newError(e, LOC), {root: true})
      throw e;
    }
  },
  /**
   * convert an array of [{id:...},...] to an array of elements
   */
  async elements({commit, getters}, list) {
    const LOC = 'board.elements'
    try {
      let result = []
      let board = getters.active;
      for (let index = 0; index < list.length; index++) {
        if (board.elements[list[index].id]) {
          result.push(board.elements[list[index].id])
        } else {
          warn(`unknown id ${list[index].id} in board ${board.id} list`, LOC)
        }
      }
      return result;
    } catch (e) {
      error(e.message, `${LOC}.catch`)
      throw e;
    }
  },
  async reset({commit}) {
    debug('reset', 'store.board.reset')
    await commit('clearCache')
  },

  async setBoard({commit}, board) {
    debug(`id: ${board.id}`, 'store.board.setBoard')
    commit('setBoard', board)
  },

  async setElement({commit, getters}, element) {
    let board = getters.active;
    Vue.set(board.elements, element.id, element)
  }
}


export const getters = {
  boards: state => {
    return state.boards;
  },
  activeColumnIndex: state => {
    return state.activeColumnIndex;
  },
  active: state => {
    if (state.activeBoardIndex < 0 || state.activeBoardIndex >= state.boards.length) {
      warn(`no board active ${state.activeBoardIndex}`, 'store.board.active')
      return {elements: []} // an invalid board
    } else {
      return state.boards[state.activeBoardIndex];
    }
  },
  id: state => {
    if (state.activeBoardIndex < 0 || state.activeBoardIndex >= state.boards.length) {
      throw new newError('no board active', 'store.board.boardId')
    }
    return state.boards[state.activeBoardIndex].id
  },
  xxx: state => {
    return getters.active(state).element;
  },
  element: (state) => (id) => {
    let board = getters.active(state);
    if (id < 0) {
      return {
        type: 'text'
      }
    } else if (board.elements[id]) {
      return board.elements[id];
    } else {
      throw new Error(`unknown element id ${id}`)
    }
  },
  /**
   * returns the column that active
   */
  column: (state) => {
    const LOC = 'board.column'
    let columns = getters.columns(state);
    if (state.activeColumnIndex < 0 || ! columns || state.activeColumnIndex >= columns.length) {
      debug(`no columns found in ${state.columnsId}`)
      return {}
    }
    let board = getters.active(state);
    let colId = columns[state.activeColumnIndex].id
    return board.elements[colId]
  },
  /**
   * returns an array of columns
   */
  columns: (state) => {
    let board = getters.active(state);
    let columns = board.elements[state.columnsId]
    return columns.elements
  },
  count: (state) => {
    return state.counter
  },
  publicImageRoot: (state, getters) => {
    return Axios.defaults.baseURL + '/public/image/' + getters.active.id + '/'
  },
}

export const board = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
