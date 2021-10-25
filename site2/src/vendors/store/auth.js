/**
 * global authentication
 */

import { axiosActions } from '../lib/const';
import { debug, warn, error } from '../lib/logging';
import Axios from '../lib/axios';
import {setHeaders} from '../lib/axios';
// SHOULD WORK :  import Vue from 'vue';


export const state = () => ({
  status: '',
  username: '',
  email: '',
  password: '',
  token: '',
  rights: [],
  refreshToken: '',
  events: [],
  debug: true
})

export const mutations = {
  request(state) {
    state.token = ''
    state.status = 'loading'
  },
  success(state, info) {
    state.status = 'sucess';
    state.username = info.user.name;
    state.email = info.user.email;
    state.token = info.token;
    state.rights = info.rights;

    localStorage.setItem('authtoken', info.token)
    setHeaders(state.token)
    if (info.refreshToken) {
      // only when its a true login, not a /refresh
      localStorage.setItem('refresh-token', info.refreshToken)
    }
  },
  error(state, messaage) {
    localStorage.removeItem('refresh-token')
    error(`auth error: ${messaage}`, 'auth.error')
    state.status = 'error'
  },
  logout(state) {
    localStorage.removeItem('refresh-token');
    setHeaders(false)
    state.status = '';
    state.username = '';
    state.email = '';
    state.password = '';
    state.token = '';
    state.refreshToken = '';
    state.rights = [];
  },

  /**
   * @param {*} state
   * @param {*} event Object {name, call, action}
   *   action: 'login', 'logout', 'error'
   *   action can be string for one or an array of events
   */
  eventAdd(state, event) {
    if (!event.name || !event.call || !event.action) {
      error(`event should have name, call and action. got ${JSON.stringify(event)}`, 'auth.eventAdd');
      return;
    }
    event.action = typeof event.action === 'string' ? [event.action] : event.action;

    let index = state.events.findIndex( e => e.name === event.name);
    if (index >= 0) {
      state.events[index] = event
    } else {
      state.events.push(event)
    }
    // console.log('evts:', state.events)
  },
  eventDelete(state, event) {
    if (typeof event === 'string') {
      event = {name : event}
    }
    let index = state.events.findIndex( e => e.name === event.name);
    if (index => 0) {
      state.events.splice(index, 1)
    } else {
      warn(`the event named ${event.name} was not found`)
    }
  },

}

export const actions = {
  async login({state, commit, dispatch}, user) {
    commit('request');
    try {
      // clear any login errors
      await dispatch('status/clear', undefined, {root: true})
      let result = await Axios.post('/auth', {
        username: user.username,
        password: user.password
      })
      if (axiosActions.hasErrors(result)) {
       // await dispatch('auth/logout', undefined,{root: true})
        throw new Error(axiosActions.errorMessage(result))
      } else {
        // ToDo: TMP SHOULD WORK Vue.$cookies.set('dropperAuth', axiosActions.data(result).token)
        try {
          await dispatch('user/init', axiosActions.data(result).user, {root: true} )
        } catch (e) {
          // if its an error we do not minde
        }
        await dispatch('auth/sendEvent', {action: 'login', data: axiosActions.data(result).user}, {root: true});

        Axios.onTokenExpired( async () => {
          try {
            debug(`auth.onTokenExpired called`)
            await this.logout({commit, dispatch})
            return true;
          } catch (e) {
            return false;
          }
        })
        commit('success', axiosActions.data(result));
        if (state.debug) {
          try {
            let info = await Axios.get('info');
            if (!axiosActions.hasErrors(info)) {
              info = axiosActions.data(info);
              debug(`mongo: ${info.mongo ? info.mongo.connectionString : '--no info--'}`)
            }
          } catch (e) {
            // not interested in the errors.
          }
        }


        // Why again??  await dispatch('auth/sendEvent', {action: 'login'}, {root: true})
        return true;
      }
    } catch( err) {
      await dispatch('auth/logout',  undefined, {root: true})
      throw new Error(err.message)
    }
  },

  async logout({commit, dispatch}) {
    debug('logout', 'store.board.logout')
    commit('logout')
    await dispatch('auth/sendEvent', {action: 'logout'}, {root: true})
  },

  async sendEvent({commit, dispatch, getters}, eventObj) {
    try {
      let evts = getters.eventList(eventObj.action);
      for (let index = 0; index < evts.length; index++) {
        debug(`sendEvent ${eventObj.action} call: ${evts[index].call}`, 'store.auth.sendEvent')
        await dispatch(evts[index].call, eventObj.data, {root: true})
      }
    } catch(e) {
      error(`error on eventbus ${e.message}`, 'auth.sendEvent')
    }
  },

  async registerEvent({commit}, event) {
    debug(`register event ${event.name}.${event.call} on ${event.action}`, 'store.auth.registerEvent')
    commit('eventAdd', event);
  },
  async unRegisterEvent({commit}, event) {
    commit('eventDelete', event);
  },
  /**
   * restore the session from the previous stored token
   *
   * @param {}
   */
  async restore({state, commit, dispatch}) {
    let token =  localStorage.getItem('refresh-token') || '';
    if (token && token.length) {
      return Axios.post('/auth/refresh', {
        token: token
      }
        )
        .then(async (result) => {
          if (axiosActions.hasErrors(result)) {
            dispatch('auth/logout')
            throw new Error(axiosActions.errorMessage(result))
          } else {
            debug('restore success')
            commit('success', axiosActions.data(result));
            await dispatch('auth/sendEvent', {action: 'login', data: axiosActions.data(result)}, {root: true})
            if (state.debug) {
              let info = await Axios.get('info');
              if (!axiosActions.hasErrors(info)) {
                info = axiosActions.data(info);
                debug(`mongo: ${info.mongo ? info.mongo.connectionString : '--no info--'}`)
              }
            }
            return true;
          }
        })
        .catch(async (err) => {
          await dispatch('logout')
          throw new Error(err.message)
        })
    }
  }
}
export const getters = {
  isLoggedIn: (state) => { return !!state.token },
  status: (state) => { return state.status},
  user: (state) => { return {username: state.username, email: state.email}},
  token: (state) => { return state.token.length ? state.token : false },
  authHeader: (state) => {
    debug(state, 'auth.authHeader')
    if (state.token && state.token.length) {
      return { 'authorization': `bearer ${state.token}` }
    }
    return false;
  },
  eventList: (state) => (action) => {
    if (action.length) {
      return state.events.filter( e => e.action.indexOf(action) >= 0 );
    } else {
      error(`eventlist needs an action paramater`)
    }
  },
  rights: (state) => {
    return state.rights
  },
  hasRights: (state) => (right) => {
    return state.rights.indexOf(right) >= 0;
  }

}

export const auth = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
