<template>
  <panel-info
      title="server">
    <view-text label="URL">
      {{ config.serverUrl }}
    </view-text>
    <view-text label="mode">
      {{ config.mode }}
    </view-text>
  </panel-info>
</template>

<script>
import PanelInfo from "../panel-info.vue";
import {serverConfig} from "../../vendors/lib/axios";
import ViewText from "../view-text.vue";

export default {
  name: "api-panel",
  components: {ViewText, PanelInfo},
  setup() {
    return {
      config: serverConfig()
    }
  }
}
</script>

<style scoped>

</style>
