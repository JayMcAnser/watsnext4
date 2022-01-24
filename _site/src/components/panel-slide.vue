<template>
  <div name="slide" class="transition duration-500 ease-in-out">
    <div
        v-if="showMenu"
        class="absolute bg-gray-200 w-56 right-0 top-0 min-h-screen p-5" >
       <slot></slot>
    </div>
  </div>
</template>

<script>
/**
 * a panel that slides in from the right
 */
import { useStore } from 'vuex';
import {computed } from 'vue';

export default {
  name: "panel-slide",
  setup(props) {
    const store = useStore();
    const showMenu = computed(() => {
      return store.getters['status/rightDrawer']
    })
    return {
      showMenu
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
