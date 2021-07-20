<template>
  <div
      @blur="message"
      tabindex="0"
  >
    THIS IS THE ART PAGE
    <router-view></router-view>
  </div>
</template>

<script>
import ListGrid from "../components/list-grid.vue";
import Pager from "../components/pager.vue";
import {useStore} from "vuex";
import {onMounted, computed} from "vue";
import SearchBar from "../components/search-bar.vue";
import {debug} from "../vendors/lib/logging";

export default {
  name: "art",
  components: {SearchBar, Pager, ListGrid},
  setup() {
    let listHandle = false;
    const store = useStore();
    const items = computed(() => {
      return store.getters['art/items'](listHandle)
    })
    const setSearch = async function(definition) {
      debug(  `search: ${definition.value}`)
      listHandle = await store.dispatch('art/list', definition)
    }
    const message = function() {
      debug('this is art view')
    }
    return {
      items,
      setSearch,
      message
    }
  }
}
</script>

<style scoped>

</style>
