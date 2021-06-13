<template>
  <form novalidate @submit.prevent="onsubmit">  <div>SEARCH BAR</div>
    <input v-model="searchFor" />
    <button type="submit">Search</button>
  </form>
</template>

<script>
import {ref} from "vue";

export default {
  name: "search-bar",
  emits: [
    'changed'
  ],
  setup(props, {emit}) {
    const searchFor = ref('')
    const onsubmit = function() {
      console.log('do search')
      emit('changed', {value: searchFor})
    }
    return {
      onsubmit,
      searchFor
    }
  }
}
</script>

<style scoped>

</style>
