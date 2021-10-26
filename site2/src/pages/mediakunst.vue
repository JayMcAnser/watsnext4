<template>
 <!-- <mediakunst-panel
  title="Mediakunst">

  </mediakunst-panel>
  -->
  <router-view></router-view>
</template>

<script>

import MediakunstPanel from '../components/mediakunst/index.vue'
export default {
  name: "mediakunst",
  components: {MediakunstPanel}
}
</script>

<style scoped>

</style>
