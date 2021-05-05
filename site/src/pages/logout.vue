<template>
  <div>You are being logged off</div>
</template>

<script>
import {useRouter} from "vue-router";
import {useStore} from 'vuex';

export default {
  name: "logout",
  setup(props, context) {
    let store = useStore();
    store.dispatch('auth/logout');
    let router = useRouter();
    router.replace('/')
  }
}
</script>

<style scoped>

</style>
