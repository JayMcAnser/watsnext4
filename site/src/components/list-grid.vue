<template>
  <div>
    <list-search-order
        search ='test'
        @search="searchChanged"
    >

    </list-search-order>
    <list-result>

    </list-result>
  </div>
</template>

<script>
import ListSearchOrder from "./list-search-order.vue";
import { ref } from 'vue'
import {debug} from "../vendors/lib/logging";
import ListResult from "./list-result.vue";

export default {
  name: "list-grid",
  components: {ListResult, ListSearchOrder},

  setup(props, {emit}) {
    const searchChanged = (searchInfo) => {
      debug(`search for ${searchInfo.value}`, 'list-grid')
      console.log('search', searchInfo)
    }
    return {
      searchChanged
    }
  }
}
</script>

<style scoped>

</style>
