<template>
  <div>
    <list-search-order
        search =''
        @search="searchChanged"
    >
    </list-search-order>
    <slot name="list"
          :records="queryResult.records"
    >
      <!--
      <ul>
        <li  v-for="rec in queryResult.records" :key="rec._id">
          <slot
              name="record"
              :data="rec"
          ></slot>
        </li>
      </ul>
      -->
    </slot>
  </div>
</template>

<script lang="ts">
import ListSearchOrder from "./list-search-order.vue";
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {debug} from "../vendors/lib/logging";
import ListResult from "./list-result.vue";
import {Model, IQueryResult} from "../models/model";
import {SearchDefinition} from "../lib/search-definition";
import ArtPanel from "./art-panel.vue";

export default {
  name: "list-grid",
  components: {ArtPanel, ListResult, ListSearchOrder},
  props: {
    modelName: {
      type: String,
      default: 'art'
    }
  },

  setup(props, {emit}) {
    const question = new SearchDefinition('');
    const dataset = ref(new Model({modelName: props.modelName}))
    let queryResult = ref(dataset.value.emptyResult());
    const searchChanged = async (searchInfo) => {
//      debug(`search for ${searchInfo.value}`, 'list-grid')
      question.value = searchInfo.value;
      dataset.value.unLink(queryResult.value);
      queryResult.value = await dataset.value.query(question);
//      debug(`found ${queryResult.value.records.length} records, rec: ${JSON.stringify(queryResult.value.records[0])}`)
    }
    onBeforeUnmount( () => {
      dataset.value.unLink(queryResult.value);
    })
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
