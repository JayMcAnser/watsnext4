<template>
  <div class="flex w-full" v-click-outside="close">
    <div
        v-if="showMenu"
        class=" bg-red-300 w-full absolute bg-gray-200 w-full bottom-0"
    >
      <div
          class="bg-green-300 m-6" >
        <slot> You 4</slot>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * a panel that slides in from the right
 */
import { useStore } from 'vuex';
import {debug} from '../vendors/lib/logging'
import {computed } from 'vue';

export default {
  name: "panel-slide-up",
  setup(props) {
    const store = useStore();
    const showMenu = computed(() => {
      return store.getters['status/bottomDrawer']
    })
    const close = async function() {
      if (showMenu) {
        debug('close slideup', 'slideup')
        await store.dispatch('status/bottomDrawer', false);
      }
    }
    return {
      showMenu,
      close
    }
  }
}
</script>

<style scoped>
.navbar {
  transition: all 330ms ease-out;
}

.navbar-open {
  transform: translateX(0%);
}
.navbar-close {
  transform: translateX(-100%);
}
</style>
