
<template>
  <div>
    <div>
      <form class="w-full flex md:ml-0" action="#" method="GET">
        <label for="search-field" class="sr-only">Search</label>
        <div class="relative w-full text-gray-400 focus-within:text-gray-600">
          <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <SearchIcon class="ml-6 h-5 w-5" aria-hidden="true" />
          </div>
          <input id="search-field"
                 class="block w-48 h-full pl-12 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                 placeholder="Search"
                 type="text"
                 @keyup="search"
                 name="search" />

        </div>
      </form>
    </div>
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
import { SearchIcon } from '@heroicons/vue/solid'

export default {
  name: "panel-grid",
  components: {
    SearchIcon
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
      await loadRecords()
    })
    const search = (event) => {
      debug(`update list to ${event.target.value}`)
      if (event.target) {
        props.model.query(event.target.value).then((v) => {
          records.value = v.records
        })
      }
    }
    return {
      records,
      search
    }
  }
}
</script>

<style scoped>

</style>
