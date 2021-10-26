<template>
  <panel-info
    title="server">
    <view-text label="database server">{{ connectionString }}</view-text>
    <view-text label="database user">{{ mongoUser }}</view-text>
    <view-text label="system email">{{ email }}</view-text>
  </panel-info>
</template>

<script>
import PanelInfo from "../panel-info.vue";
import ViewText from "../view-text.vue";
import {database} from "../../lib/store";
import {ref} from "vue";
import {debug} from "../../vendors/lib/logging";

export default {
  name: "api-panel",
  components: {ViewText, PanelInfo},
  setup() {
    const connectionString = ref('');
    const mongoUser = ref('')
    const email = ref('')
    const apiInfo = async () => {
      let info = await database.apiInfo();
      connectionString.value = info.mongo.connectionString;
      mongoUser.value = info.username
      email.value = info.email
      // debug(info, 'watsnext.api-panel')
      return info
    }
    apiInfo()
    return {
      apiInfo,
      connectionString,
      mongoUser,
      email
    }
  }
}
</script>

<style scoped>

</style>
