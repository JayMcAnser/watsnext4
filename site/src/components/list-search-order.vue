<template>
  <div
    class="p-grid">
    <div class="p-col-10 p-md-8">
      <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-search"></i>
                    </span>
        <InputText placeholder="Search" v-model="search" v-on:keyup="searchChanged" />

      </div>
      <div class="p-col-2 p-md-4" v-if="order">
        order {{ order }}
      </div>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue'
import {debug} from "../vendors/lib/logging";


import { getDirective } from 'vue-debounce'

export default {
  name: "list-search-order",
  props: {
    order: {
      type: Object
    },
    search: {
      type: String
    }
  },
  emits: ['search'],
  directives: {
    debounce: getDirective({listenTo: ['input', 'keyup']})
  },
  setup(props, {emit})  {
    const search = ref(props.search);
    const order = props.hasOwnProperty('order') ? false : ref(props.order);

    const searchChanged = () => {
     // debug(`search: ${search.value}`, 'list-search-order')
      emit('search', {value: search.value, order: order})
    }
    return {
      searchChanged,
      search,
      order
    }
  }
}
</script>

<style scoped>

</style>
