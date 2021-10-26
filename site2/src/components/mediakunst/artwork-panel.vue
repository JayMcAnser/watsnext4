<template>
  <panel-info
      title="art work"
  >
    <router-link to="/mediakunst/artwork">
      list of art and a way to open the full list view
    </router-link>
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

    }
  }
}
</script>

<style scoped>

</style>
