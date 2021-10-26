<template>
  <div v-if="isLoggedIn" class="h-full">
    <Home />
  </div>
  <div v-else>
    <LoginPage></LoginPage>
  </div>
</template>


<script>

  import {debug} from "../vendors/lib/logging";
  import { ref, computed } from 'vue';
  import Home from "./home.vue";
  import LoginPage from "./login-page.vue";
  import {useStore} from 'vuex'

  export default {
    name: "index",
    components: {LoginPage, Home},
    setup() {
      const search = ref('')
      const store = useStore()
      const isLoggedIn = computed(() => { return store.getters['auth/isLoggedIn']})
      return {
        isLoggedIn,
      }
    }
}
</script>


<style scoped>

</style>
