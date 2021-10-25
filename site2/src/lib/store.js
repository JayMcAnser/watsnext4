import {ref} from "vue";
import {debug} from '../vendors/lib/logging';

export const activeMenu = ref('/')

export function setMenu(menu) {
  // debug(`menu: ${menu}`)
  activeMenu.value = menu
}
