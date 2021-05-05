
import { createStore } from 'vuex';


import {board} from './board';
import {element} from './element';
import {auth} from '../vendors/store/auth';
import {status} from '../vendors/store/status';
import {user} from '../vendors/store/user';

const defaultModule = {
  state: {
    counter: 0
  },
  mutations: {
    increment(state) {
      state.counter++
    }
  },
  actions: {
    increment(context) {
      context.commit('increment')
    }
  },
  getters: {
    count: (state) => {
      return state.counter
    }
  }
}
const store = createStore({
  modules: {
    defaultModule,
    board: board,
    element,
    auth,
    status,
    user,
  }
})

export { store };

// //actions.nuxtServerInit({commit: 1})
