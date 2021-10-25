<template>
  <info-panel
      title="server">
    <view-text label="URL">
      {{ config.serverUrl }}
    </view-text>
    <view-text label="mode">
      {{ config.mode }}
    </view-text>
  </info-panel>
</template>

<script>
import InfoPanel from "../info-panel.vue";
import {ServerConfig} from "../../vendors/lib/axios";
import ViewText from "../view-text.vue";

export default {
  name: "api-panel",
  components: {ViewText, InfoPanel},
  setup() {
    return {
      config: ServerConfig()
    }
  }
}
</script>

<style scoped>

</style>
