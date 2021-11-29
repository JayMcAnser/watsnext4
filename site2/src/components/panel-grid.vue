
<template>
  <div>
    <panel-grid-searchbar
        :model="model"
        @searchchange="searchChanged"
    >

    </panel-grid-searchbar>
    <div class="flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th v-for="field in fields" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{field.label}}
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="record in records" :key="record.id">
                  <td v-for="field in fields" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ record[field.field] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted} from "vue";
import {debug} from "../vendors/lib/logging";
// import { SearchIcon } from '@heroicons/vue/solid'
import PanelGridSearchbar from "./panel-grid-searchbar.vue";

export default {
  name: "panel-grid",
  components: {
    PanelGridSearchbar,
//    SearchIcon
  },
  props: {
    fields: Array,  // field, caption, canOrder, width
    model: Object,  // where to run on
  },
  setup(props) {
    const records = ref([])
    const loadRecords = async () => {
      let result = await props.model.query('a')
      records.value = result.records;
    }
    onMounted(async () => {
      props.model.then( async (model) => {
        console.log('model', model)
        // why can this not be done like:  records.value = await model.query('a') ????
        // records.value = await model.query('a')
        let result = [] // await model.query('a')
        records.value = result.records;
      })
    })
    // const search = (event) => {
    //   debug(`update list to ${event.target.value}`)
    //   // if (event.target) {
    //   //   props.model.query(event.target.value).then((v) => {
    //   //     records.value = v.records
    //   //   })
    //   // }
    //   props.model.then( async (model) => {
    //     console.log('model', model)
    //     let text = event.target.value;
    //     let result = []
    //     if (text) {
    //       text = text.trim();
    //       if (text.length) {
    //         result = await model.query(event.target.value)
    //       }
    //     }
    //     records.value = result.records;
    //   })
    // }
    const searchChanged = (searchFor) => {
      console.log(`searchChanged: `, searchFor);
      props.model.then( async (model) => {
        console.log('model', model)
        let result = []
        result = await model.query(searchFor)
        records.value = result.records;
      })
    }
    return {
      records,
      // search,
      searchChanged
    }
  }
}
</script>

<style scoped>

</style>
