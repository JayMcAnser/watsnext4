
import Axios, {setHeaders} from "../src/vendors/lib/axios";
import {axiosActions} from "../src/vendors/lib/const";

const AuthToken = new Promise( (resolve) => {
  return Axios.post('/auth', {
    username: 'john@test.com',
    password: '123456'
  }).then((result) => {
    if (axiosActions.hasErrors(result)) {
      // await dispatch('auth/logout', undefined,{root: true})
      throw new Error(axiosActions.errorMessage(result))
    } else {
      let data = axiosActions.data(result);
      setHeaders(data.token)
      resolve (data.token)
    }
  })
})

export default {
  AuthToken: AuthToken
};
