<template>
  <div>
    <div> List result</div>
    <ul>
      <li v-for="ref in records" :key="ref.id">
        Do {{ref.title}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">

// import {IQueryResult} from "../models/model";
import {ref} from 'vue'

export default {
  name: "list-result",
  props: {
    dataset: {
      type: Object,
    }
  },
  setup() {
    const records = ref([
      { title: 'the one'}
    ])
    return {
      records
    }
  }
}
</script>

<style scoped>

</style>
