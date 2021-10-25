/**
 * Routes for authentication
 */
 
const authRouter = [  
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "auth" */'../pages/login.vue')
  },
]

export default authRouter