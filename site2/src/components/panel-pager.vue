<template>
  <div>PAGER {{recordCount }}</div>
</template>

<script>
import { onMounted, ref} from "vue";
import {debug} from "../vendors/lib/logging";

export default {
  name: "panel-pager",
  props: {
    search: Object
  },
  setup(props) {
    const recordCount = ref(0)
    onMounted( () => {
      console.log('Pager: changed')
      props.search.registerEvent('pager', 'changed', async (search) => {
        debug('search changed', 'panel.pager')
        let mdl = await (search.model)
        let cnt = await mdl.count(search);
        debug(`count in panel.pager ${cnt}`)
        recordCount.value = cnt;
      })
    })
    return {
      recordCount
    }
  }
}
</script>

<style scoped>

</style>
