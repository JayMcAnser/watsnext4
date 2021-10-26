
// import Home from '../pages/home.vue';
// import Boards from '../pages/boards.vue';
// import {useRouter} from "vue-router";

import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
// @ts-ignore
import {setMenu} from "../lib/store";

const index : Array<RouteRecordRaw> =  [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../pages/dashboard.vue')
  },
  {
    path: '/mediakunst',
    name: 'mediakunst',
    component: () => import('../pages/mediakunst.vue'),
    children:[
      {
        path: '',
        component: () => import('../components/mediakunst/index.vue')
      },
      {
        path: 'artwork',
        component: () => import('../components/mediakunst/artwork-grid.vue')
      }
    ]
  },
  {
    path: '/royalties',
    name: 'royalties',
    component: () => import('../pages/not-yet.vue')
  },
  {
    path: '/distribution',
    name: 'distribution',
    component: () => import('../pages/not-yet.vue')
  },
  {
    path: '/watsnext',
    name: 'watsnext',
    component: () => import('../pages/watsnext.vue'),
    children:[
      {
        path: '',
        component: () => import('../components/watsnext/index.vue')
      },
      {
        path: 'artwork',
        component: () => import('../components/watsnext/artwork-grid.vue')
      },
    ]
  },
  {
    path: '/config',
    name: 'config',
    component: () => import('../pages/config.vue')
  },
  {
    // path: "*",
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import('../pages/not-found.vue'),
  }

  /*
    { path: '/about', name: 'about', component: () => import('../pages/about.vue')},
    { path: '/logout', name: 'logout',
      component: () => import('../pages/logout.vue')
    },
    { path: '/notyet', name: 'notyet', component: () => import('../pages/not-yet.vue')},
    { path: '/mediakunst',
      name: 'mediakunst',
      component: () => import('../components/mediakunst/art-list.vue'),
      children:[
        {
          path: 'art-list',
          component: () => import('../components/mediakunst/art-list.vue')
        }
      ]
    },
    { path: '/art',
      name: 'art',
      component: () => import('../pages/art.vue'),
      children:[
        {
          path: 'list',
          component: () => import('../components/art/list.vue')
        },
        {
          path: 'show/:id',
          component: () => import('../components/art/show.vue')
        },
        {
          path: '',
          component: () => import('../components/art/list.vue')
        },
      ]
    },

    { path: '/profile', name: 'profile', component: () => import('../pages/profile.vue')},
  //  { path: '/board/:id/:layout?', name: 'board', component: () => import('../pages/board.vue')},
    { path: '/test', name: 'test', component: () => import('../pages/test.vue')},
    { path: '/user', name: 'user', component: () =>import('../pages/user.vue')}
  */
]


const router = createRouter({
  history: createWebHistory(),
  routes: index,
});
router.afterEach((to, from, next) => {
  console.log(to);
  setMenu(to.name);
  //next();
})


export  {
  router
};
