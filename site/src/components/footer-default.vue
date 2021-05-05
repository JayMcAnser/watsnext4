<template>
  <footer
      class="bg-gray-50 text-gray-700 border-t-2 border-gray-200"

  >
    <div class="flex flex-row flex-nowrap flex-none justify-around">
      <div
          class="h-26 w-12 p-2"
      >
        <slot name="left1"></slot>
      </div>
      <div
        class=" h-26 w-12 p-2"
      >
        <slot name="left2"></slot>
      </div>
      <div
        class="h-26 w-12 p-2"
      >
        <slot name="mid"></slot>
      </div>
      <div
        class="h-26 w-12 p-2"
      >
        <slot name="right2"></slot>
      </div>
      <div
        class="h-26 w-12 p-2"
      >
        <slot name="right1"></slot>
      </div>

    </div>
  </footer>
</template>

<script>
import {computed} from "vue";
import {useStore} from 'vuex'

export default {
  name: "footer-default",
  setup(props) {
    const store = useStore()
    const isAuthenticated = computed( () => store.getters['auth/isLoggedIn'])
    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>

</style>
