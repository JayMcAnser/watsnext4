<template>
  <info-panel
      :record="record"
      :fields="fields"
      model-name="art"
  >
    <template #caption>General</template>
  </info-panel>
</template>

<script>
import InfoPanel from "../info-panel.vue";
import {ref} from "vue";

let FIELDS = [
  {name: 'type', label: 'type'},
  {name: 'title', label: 'title'},
  {name: 'titleEn', label: 'title english'},
  {name: 'searchcode', label: 'search code'},
]

export default {
  name: "general",
  components: {InfoPanel},
  props: {
    record: Object
  },
  setup({props}) {
    const fields = ref(FIELDS)
    return {
      fields
    }
  }
}
</script>

<style scoped>

</style>
