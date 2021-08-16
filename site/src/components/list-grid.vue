<template>
  <div>
    <list-search-order
        search =''
        @search="searchChanged"
    >

    </list-search-order>
    <!--
    <list-result
        :query="dataset"
    >

    </list-result>
    -->
    <ul>
      <li v-for="rec in queryResult.records" :key="rec._id">
        Do {{rec.title}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import ListSearchOrder from "./list-search-order.vue";
import {onMounted, ref} from 'vue'
import {debug} from "../vendors/lib/logging";
import ListResult from "./list-result.vue";
import {Dataset, IQueryResult} from "../models/dataset";
import {SearchDefinition} from "../lib/search-definition";

export default {
  name: "list-grid",
  components: {ListResult, ListSearchOrder},
  props: {
    modelName: {
      type: String,
      default: 'art'
    }
  },

  setup(props, {emit}) {
    const question = new SearchDefinition('');
    const dataset = ref(new Dataset({modelName: props.modelName}))
    let queryResult = ref(dataset.value.emptyResult());
    const searchChanged = async (searchInfo) => {
//      debug(`search for ${searchInfo.value}`, 'list-grid')
      question.value = searchInfo.value;
      dataset.value.unLink(queryResult.value);
      queryResult.value = await dataset.value.query(question);
//      debug(`found ${queryResult.value.records.length} records, rec: ${JSON.stringify(queryResult.value.records[0])}`)
    }

    return {
      queryResult,
      dataset,
      searchChanged
    }
  }
}
</script>

<style scoped>

</style>
