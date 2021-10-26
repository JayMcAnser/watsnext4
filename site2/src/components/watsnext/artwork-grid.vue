<template>
  <page-canvas>
    <panel-grid
        :fields="fields"
        :model="model"
    >

    </panel-grid>
  </page-canvas>
</template>

<script>

import PageCanvas from "../page-canvas.vue";
import PanelGrid from "../panel-grid.vue";
import {computed} from "vue";
import {database} from "../../lib/store";

const fields = [
  {
    label: 'Title',
    field: 'title',
  },
  {
    label: 'Artist',
    field: 'artistName'
  },
  {
    label: 'Year',
    field: 'period'
  }
]

export default {
  name: "artwork-grid",
  components: {PanelGrid, PageCanvas},
  setup() {
    const model = computed(() => {
      return database.tables.art
    })
    return {
      fields,
      model
    }
  }
}
</script>

<style scoped>

</style>
