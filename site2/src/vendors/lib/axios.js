/**
 * connectiong to the API server
 *
 * version 1.0 Jay 2021-02-03
 * see: https://forum.vuejs.org/t/add-header-token-to-axios-requests-after-login-action-in-vuex/38834/2
 */

import Axios from 'axios'
import {debug, error as errorLog, RequestLoginError} from './logging';

// SHOULD WORK BUT ... import { router } from '../../routes';
import { axiosActions } from './const';

let onTokenExpiredFunc = false;

let serverUrl

let env = import.meta.env;
if (env === undefined && process) {
  import('vite').then(({ loadEnv }) => {
    env = loadEnv(process.env.NODE_ENV, process.cwd());
    serverUrl = env && env.VITE_API_URL ? env.VITE_API_URL : 'http://localhost:3050/api';
    Axios.defaults.baseURL = serverUrl;
    Axios.server = Axios.defaults.baseURL;
  })
} else {
  console.log('current env:', env)
  serverUrl = env && env.VITE_API_URL ? env.VITE_API_URL : 'http://localhost:3050/api';
  Axios.defaults.baseURL = serverUrl;
// for easy access an not locking into Axios
  Axios.server = Axios.defaults.baseURL;
}
Axios.headers = {
  'Accept': 'application/json',
    'Content-Type': 'application/json',
}

// Vite: https://vitejs.dev/guide/env-and-mode.html
//
// let axiosApi;
// try {
//
//   axiosApi = axios.create({
//     // withCredentials: true,
//     baseURL: serverUrl,
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//     }
//   })
// } catch(e) {
//   errorLog(`access denied to server: ${e.message}`)
//   axiosApi = {}
// }
// debug(`api server: ${axiosApi.defaults.baseURL}`, 'lib/axios')

// axiosApi.cancelToken = axios.CancelToken;
// axios.isCancel = axios.isCancel;

// axiosApi.interceptors.request.use(
Axios.interceptors.request.use(
  (config) => {
    if (typeof localStorage === 'undefined') {
      return config;
    }
    let token = localStorage.getItem('authtoken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${ token }`
    }
    return config
  },function (error) {
    errorLog(error, 'lib/axios.interceptor.request')
    return Promise.reject(error)
  }
)
let LoopCounter401 = 0;

//axiosApi.interceptors.response.use(null,
Axios.interceptors.response.use(null,
  async function (error) {
    const LOC = 'axios.interceptor.response';
    if (error.response && error.response.status === 401 ) {
      debug('refresh token', LOC)
      if (typeof localStorage !== 'undefined') {
        let refreshToken = localStorage.getItem('refresh-token');
        if (refreshToken && LoopCounter401 < 1) {
          LoopCounter401++;
          try {
            let result = await Axios.post('auth/refresh', {token: refreshToken});
            if (axiosActions.isOk(result)) {
              let data = axiosActions.data(result)
              debug(`new token: ${data.token}`, LOC)
              localStorage.setItem('authtoken', data.token);
              // Vue.$cookies.set('dropperAuth', data.token)
              return Axios.request(error.config)
            }
          } catch (e) {
            debug(`refresh token expired`, LOC)
            if (onTokenExpiredFunc) {
              if (!onTokenExpired()) {
                throw new RequestLoginError(e.message, 'axios')
              }
            }
          }
        }
      } else {
        LoopCounter401 = 0;
        debug('no refresh token', LOC)
        // SHOULD WORK BUT ...  await router.push({ name: 'login'})
      }
    } else {
      if (Axios.showErrors) {
        errorLog(error, LOC);
      }
    }
    return Promise.reject(error)
  }
)

export const setHeaders = function(auth = false) {
  debug(auth, 'axios.setHeader')
  if (auth) {
    Axios.defaults.headers.common['Authorization'] = `bearer ${auth}`;
    Axios.defaults.headers.common['Authorization'] = `bearer ${auth}`;
  } else {
    delete Axios.defaults.headers.common.Authorization;
    delete Axios.defaults.headers.common.Authorization;
  }

  // if (auth) {
  //   axiosApi.defaults.headers.common['Authorization'] = `bearer ${auth}`;
  //   axios.defaults.headers.common['Authorization'] = `bearer ${auth}`;
  // } else {
  //   delete axiosApi.defaults.headers.common.Authorization;
  //   delete axios.defaults.headers.common.Authorization;
  // }
}

export const onTokenExpired = function(call) {
  onTokenExpiredFunc = call
}
Axios.onTokenExpired = onTokenExpired;
Axios.logToConsole = function (doLog) {
  Axios.showErrors = !!doLog
}

// export default axiosApi;
export default Axios;

