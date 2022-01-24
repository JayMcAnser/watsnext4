<template>
  <general
      :record="record"
  >
  </general>
</template>

<script>
import {useRoute} from "vue-router";
import {ref, onMounted, watch} from "vue";
import ArtPanelGeneral from "./art-panel-general.vue";
import { ArtModel } from "../../models/art";
import {debug} from "../../vendors/lib/logging";
import {useStore} from "vuex";

import General from "./general.vue";

export default {
  name: "show",
  components: {General, ArtPanelGeneral},
  props: {

  },
  setup({props}) {
    const route = useRoute()
    const recordId = ref('');
    const store = useStore();

    let artModel = new ArtModel();
    let record = ref({})
    let dataset = artModel.emptyResult()

    const loadRecord = async (id) => {
      try {
        debug(`id changed: ${id}`)
        if (dataset) {
          artModel.unLink(dataset)
        }
        dataset = await artModel.findById(id);
        if (!dataset.record) {
          debug(`missing record (${id})`, 'art.show.loadRecord')
          record.value = {}
        } else {
          record.value = dataset.record
          console.log(record)
        }
      } catch(e) {
        await store.dispatch('status/error', e)
      }
    }

    onMounted( async () => {
      await loadRecord(route.params.id)
    })
    watch(() => route.params, async (toParam, prevParam) => {
      await loadRecord(toParam.id)
    })
    return {
      recordId,
      record,
    }
  }
}
</script>

<style scoped>

</style>
