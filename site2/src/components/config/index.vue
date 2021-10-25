<template>
  <page-overview>
    <setup-panel></setup-panel>
  </page-overview>
</template>

<script>
import PageOverview from "../page-overview.vue";
import SetupPanel from "./setup-panel.vue";
export default {
  name: "index",
  components: {SetupPanel, PageOverview}
}
</script>

<style scoped>

</style>
