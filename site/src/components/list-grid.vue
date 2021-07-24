<template>
  <div>
    <list-search-order
        search ='test'
        @search="searchChanged"
    >

    </list-search-order>
    <list-result
        :query="query"
    >

    </list-result>
  </div>
</template>

<script lang="ts">
import ListSearchOrder from "./list-search-order.vue";
import {onBeforeMount, ref} from 'vue'
import {debug} from "../vendors/lib/logging";
import ListResult from "./list-result.vue";
import {IQueryResult} from "../models/dataset";
import {useStore} from "vuex";

export default {
  name: "list-grid",
  components: {ListResult, ListSearchOrder},

  setup(props, {emit}) {
    let   query: IQueryResult;
    const store = useStore();
    const question = new SearchDefinition('')
    const searchChanged = (searchInfo) => {
      debug(`search for ${searchInfo.value}`, 'list-grid')
      question.query = searchInfo.value
    }

    onBeforeMount(() => {
      this.query = store.getters['database/table']['art'].query(question)
    })

    return {
      query,
      searchChanged
    }
  }
}
</script>

<style scoped>

</style>
