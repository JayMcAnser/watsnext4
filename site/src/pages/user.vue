<template>
  <div>User: {{ username }}</div>
</template>

<script>
import { ref } from 'vue';
import {useStore } from 'vuex';

export default {
  name: "user",
  setup() {
    const store = useStore();

    const username = ref(  store.getters['user/name']);
    return {
      username
    }
  }
}
</script>

<style scoped>

</style>
