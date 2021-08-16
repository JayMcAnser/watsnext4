<template>
  <div>component.art.list
  <list-grid
      model-name="art"
  >

  </list-grid>
  </div>
</template>

<script>


import ListGrid from "../list-grid.vue";
export default {
  name: "list",
  components: {
    ListGrid
  }
}
</script>

<style scoped>

</style>
