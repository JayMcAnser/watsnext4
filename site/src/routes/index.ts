
import Home from '../pages/home.vue';
import Boards from '../pages/boards.vue';
import {useStore} from "vuex";

import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

const index : Array<RouteRecordRaw> =  [
  { path: '/', name: 'home', component: Home},
  { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "auth" */ '../pages/about.vue')},
  { path: '/logout', name: 'logout',
    component: Home,
    beforeEnter: async (to, from) => {
      let store = useStore();
      await store.dispatch('auth/logout')
    },
    redirect: '/'
  },
  { path: '/board/:id/:layout?', name: 'board', component: () => import('../pages/board.vue')},
  { path: '/test', name: 'test', component: () => import('../pages/test.vue')},
  { path: '/user', name: 'user', component: () =>import('../pages/user.vue')}
]


const router = createRouter({
  history: createWebHistory(),
  routes: index,
});


export  {
  router
};
