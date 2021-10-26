<template>
  <page-overview>
    <action-panel>
    </action-panel>
    <artwork-panel>
    </artwork-panel>
  </page-overview>
</template>

<script>
import PageOverview from "../page-overview.vue";
import ActionPanel from './action-panel.vue'
import ArtworkPanel from './artwork-panel.vue';
export default {
  name: "index",
  components: {PageOverview, ActionPanel, ArtworkPanel}
}
</script>

<style scoped>

</style>
