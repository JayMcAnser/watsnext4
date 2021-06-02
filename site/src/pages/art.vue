<template>
  <div>
    <list-grid></list-grid>
    <pager></pager>
  </div>
</template>

<script>
import ListGrid from "../components/list-grid.vue";
import Pager from "../components/pager.vue";
import {useStore} from "vuex";
import {onMounted} from "vue";
export default {
  name: "art",
  components: {Pager, ListGrid},
  setup() {
    const store = useStore()

    onMounted(async () => {
      await store.dispatch('status/menu', {menu: 'art'});
    })
    return {

    }
  }
}
</script>

<style scoped>

</style>
