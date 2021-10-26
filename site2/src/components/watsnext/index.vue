<template>
  <page-overview>
    <api-panel>
    </api-panel>
    <artwork-panel>
    </artwork-panel>
  </page-overview>
</template>

<script>
import PageOverview from "../page-overview.vue";
import ArtworkPanel from './artwork-panel.vue';
import ApiPanel from "./api-panel.vue";


export default {
  name: "index",
  components: {
    ApiPanel,
    PageOverview,
    ArtworkPanel
  }
}
</script>

<style scoped>

</style>
