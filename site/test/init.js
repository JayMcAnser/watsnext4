
import Axios, {setHeaders} from "../src/vendors/lib/axios";
import {axiosActions} from "../src/vendors/lib/const";

// export const getAuthToken = () => new Promise( (resolve) => {
//   console.log('server', Axios.server)
//
//   return Axios.post('/auth', {
//     username: 'john@test.com',
//     password: '123456'
//   }).then((result) => {
//     if (axiosActions.hasErrors(result)) {
//       // await dispatch('auth/logout', undefined,{root: true})
//       throw new Error(axiosActions.errorMessage(result))
//     } else {
//       let data = axiosActions.data(result);
//       setHeaders(data.token)
//       resolve (data.token)
//     }
//   }).catch((e) => {
//     console.error(e.message)
//   })
// })

export const login = (username = 'john@test.com', password = '123456', server = Axios) => {
  return server.post('auth', {
    username, password
  }).then((result) => {
    if (axiosActions.hasErrors(result)) {
      // await dispatch('auth/logout', undefined,{root: true})
      throw new Error(axiosActions.errorMessage(result))
    } else {
      let data = axiosActions.data(result);
      setHeaders(data.token)
     return true;
    }
  }).catch((e) => {
    return e.message;
  })
}

export const logoff = () => {
  setHeaders(false)
}

