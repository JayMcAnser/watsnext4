import {ref} from "vue";
import {debug} from '../vendors/lib/logging';
import {Database} from "./database";

export const activeMenu = ref('/')

export function setMenu(menu) {
  // debug(`menu: ${menu}`)
  activeMenu.value = menu
}

/**
 * function is called after the user successfully logged in.
 *
 * @param userData Object the data return from the login
 */
export function dbInit(userData) {
  //debug(`store db init`)
  //console.log(userData)
  database.init(userData)
}

export const database = new Database()
