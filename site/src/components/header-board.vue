<template>
  <header-default
      class="flex flex-row justify-between bg-black space-x-4 py-4 px-6"
  >
    <slot name="left"></slot>
    <slot>
      <router-link to="/">DROPPER</router-link>
    </slot>
    <slot name="right">
      <button
          class="text-white cursor-pointer  outline-none focus:outline-none"
          type="button" @click="$emit('menu')">
        <MenuIcon class="h-5 w-5 text-grayblue-500"/>
      </button>
    </slot>
  </header-default>
</template>
<script>
import HeaderDefault from "./header-default.vue";
import Tabs from "./tabs.vue";
import { ref } from 'vue';
import { MenuIcon } from '@heroicons/vue/solid';
/**
 * the header that is used by the board with the listing of the views
 */

export default {
  name: "header-board",
  components: {Tabs, HeaderDefault, MenuIcon},
  data() {
    return {
      tabs: [
        {id: 'private', caption: 'private'},
        {id: 2, caption: 'public'},
        {id: 3, caption: 'shared'}
      ]
    }
  },
  setup(props) {
  },
  methods: {
    tabClick: function(ref) {
      console.log(`did click ${ref.id}`)
    }
  }
}
</script>

<style scoped>

</style>
