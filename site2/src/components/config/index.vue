<template>
  <page-overview>
    <api-panel></api-panel>
  </page-overview>
</template>

<script>
import PageOverview from "../page-overview.vue";
import ApiPanel from "./api-panel.vue";
export default {
  name: "index",
  components: {ApiPanel, PageOverview}
}
</script>

<style scoped>

</style>
