<template>
  <div>
    <div> List result</div>
    <ul>
      <li v-for="ref in query.records" :key="ref.id">
        Do {{ref.title}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">

import {IQueryResult} from "../models/dataset";

export default {
  name: "list-result",
  props: {
    query: {
      type: Object,
      default: {
        records: []
      }
    }
  },
  setup() {

    return {

    }
  }
}
</script>

<style scoped>

</style>
