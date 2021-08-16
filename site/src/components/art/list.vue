<template>
  <div>component.art.list
  <list-grid
      model-name="art"
  >
    <template
        v-slot:record="slotProps">
      <art-panel
        :record="slotProps.data">
      </art-panel>
    </template>
  </list-grid>
  </div>
</template>

<script>


import ListGrid from "../list-grid.vue";
import ArtPanel from "../art-panel.vue";
export default {
  name: "list",
  components: {
    ArtPanel,
    ListGrid
  }
}
</script>

<style scoped>

</style>
