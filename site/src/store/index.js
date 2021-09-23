
import { createStore } from 'vuex';


// import {board} from './board';
// import {art} from './art';
// import {element} from './element';
import {auth} from '../vendors/store/auth';
import {status} from '../vendors/store/status';
import {user} from '../vendors/store/user';
import {menu} from './menu';
import {database} from "./database";
import {rights} from "./rights";

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
//    board: board,
    database,
//    element,
    auth,
    status,
    user,
    menu,
    rights
  }
})
export { store };


