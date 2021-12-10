<template>
  <div>
    <form class="w-full flex md:ml-0" action="#" method="GET">
      <div class="w-full grid grid-cols-3">
        <div>
          <label for="search-field" class="sr-only">Search</label>
          <div class="relative w-full text-gray-400 focus-within:text-gray-600">
            <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <SearchIcon class="ml-6 h-5 w-5" aria-hidden="true" />
            </div>
            <input id="search-field"
                   class="block h-full pl-12 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                   placeholder="Search"
                   type="text"
                   @keyup="searchValueChanged"
                   v-model="searchFor" />

          </div>
        </div>
        <div>
         {{ recordCount }}
        </div>
        <div>
          <select
              id="location"
              v-model="searchLimit"
              @change="searchValueChanged"
              class="float-right block h-full pl-12 pr-6 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm">
            <option value="25">25</option>
            <option selected="" value="50">50</option>
            <option value="100">100</option>
            <option value="99999999">all</option>
          </select>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { SearchIcon } from '@heroicons/vue/solid'
import {debug} from "../vendors/lib/logging";
import {SearchDefinition} from "../lib/search-definition";
import {ref, } from "vue";

export default {
  name: "panel-grid-searchbar",
  components: {SearchIcon},
  emits: ['searchchange'],
  props: {
    model: Object,
    search: Object
  },
  setup(props, {emit}) {
    const searchFor = ref('');
    const searchLimit = ref('25');
    const recordCount = ref('0');
    /**
     * generate the object for the query search
     */
    const makeSearchDef = () => {
      // props.search.setSearch(searchFor.value, searchLimit.value)
      return {
        value: searchFor.value,
        limit: searchLimit.value
      }
      // return searchDefinition
    }
    const searchValueChanged = (event) => {
      // debug(`update list to ${event.target.value}`);
      debug(`update list to ${searchFor.value}`);
      emit('searchchange', makeSearchDef())
    }
    return {
      searchValueChanged,
      searchFor,
      searchLimit,
      recordCount
    }
  }
}
</script>

<style scoped>

</style>
