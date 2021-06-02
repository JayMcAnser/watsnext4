<template>
  <div>
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="w-64 flex flex-col">
        <!-- Sidebar component, swap this element with another sidebar if you like -->
        <div class="border-r border-gray-200 pt-5 pb-4 flex flex-col flex-grow overflow-y-auto">
          <div class="flex-shrink-0 px-4 flex items-center">
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg" alt="Workflow" />
          </div>
          <div class="flex-grow mt-5 flex flex-col">
            <nav class="flex-1 bg-white px-2 space-y-1">
              <div v-for="item in navigation" :key="item.name">
                <router-link v-if="itemVisible(item.key)" :to="item.to" :class="[itemActive(item.key) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group rounded-md py-2 px-2 flex items-center text-sm font-medium']">
                  <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                  {{ item.name }}
                </router-link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>


import {
  CogIcon,
  CollectionIcon,
  HomeIcon,
  PhotographIcon,
  UserGroupIcon,
  ViewGridIcon
} from "@heroicons/vue/outline/esm";
import {useStore} from "vuex";
import {debug} from '../vendors/lib/logging'



const navigation = [
  { name: 'Home', to: {name: 'home'}, icon: HomeIcon, key: 'home' },
  { name: 'Distribution', to: {name: 'notyet'}, icon: ViewGridIcon, key: 'distribution' },
  { name: 'Royalties', to: {name: 'notyet'}, icon: PhotographIcon, key: 'royalties' },
  { name: 'Art', to: {name: 'art'}, icon: ViewGridIcon, key: 'art'},
  { name: 'Mediakunst.net', to: {name: 'notyet'}, icon: UserGroupIcon, key: 'mediakunst' },
  { name: 'Contacts', to: {name: 'notyet'}, icon: CollectionIcon, key: 'contact' },
  { name: 'Settings', to: {name: 'notyet'}, icon: CogIcon, key: 'properties' },
]

export default {
  name: "menu-main",
  setup() {
    const store = useStore()
    const itemVisible = function(part) {
      let visible = store.getters['user/rightsView'](part);
     // debug(`menu[${part}] = ${visible}`)
      return visible
    },
    itemActive = function(part) {
      let active = store.getters['status/menuActive'](part);
      // debug(`menu[${part}].active = ${active}`)
      return active
    }
    return {
      navigation,
      itemVisible,
      itemActive
    }
  }
}
</script>

<style scoped>

</style>
