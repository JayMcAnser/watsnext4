
import Home from '../pages/home.vue';
//import Boards from '../pages/boards.vue';
import {useRouter} from "vue-router";

import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

const index : Array<RouteRecordRaw> =  [
  { path: '/', name: 'home', component: Home},
  { path: '/about', name: 'about', component: () => import(/* webpackChunkName: "auth" */ '../pages/about.vue')},
  { path: '/logout', name: 'logout',
    component: () => import('../pages/logout.vue')
  },
  { path: '/notyet', name: 'notyet', component: () => import('../pages/not-yet.vue')},
  { path: '/art',
    name: 'art',
    component: () => import('../pages/art.vue'),
    children:[
      {
        path: 'list',
        component: () => import('../components/art/list.vue')
      },
      {
        path: '',
        component: () => import('../components/art/list.vue')
      }
    ]
  },
  { path: '/profile', name: 'profile', component: () => import('../pages/profile.vue')},
//  { path: '/board/:id/:layout?', name: 'board', component: () => import('../pages/board.vue')},
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
