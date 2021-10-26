<template>
  <panel-info
      title="actions">
    <view-text label="server status">
      not running
    </view-text>
  </panel-info>
</template>

<script>
import PanelInfo from "../panel-info.vue";
import ViewText from "../view-text.vue";

export default {
  name: "action-panel",
  components: {ViewText, PanelInfo},
  setup() {
    return {
//      config: serverConfig()
    }
  }
}
</script>

<style scoped>

</style>
