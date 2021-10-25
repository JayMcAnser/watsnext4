
import { createStore } from 'vuex';

import {auth} from '../vendors/store/auth';
import {status} from '../vendors/store/status';
import {user} from '../vendors/store/user';
import {database} from "./database";

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
    database,
    auth,
    status,
    user,
  }
})
export { store };


