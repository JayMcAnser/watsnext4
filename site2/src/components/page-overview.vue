<template>
  <page-canvas
  :title="title">
    <div class="flex flex-row flex-wrap">
      <slot></slot>
    </div>
  </page-canvas>
</template>

<script>
import PageCanvas from "./page-canvas.vue";
export default {
  name: "page-overview",
  components: {PageCanvas},
  props: {
    title: {
      type: String
    }
  }
}
</script>

<style scoped>

</style>
