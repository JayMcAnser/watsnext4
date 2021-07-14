<template>
  <div>Layouts</div>
  <div
      class="flex w-full px-0 py-2"
      v-for="layout in layouts" :key="layout.id"
  >
    <div
        class="flex flex-col rounded-lg shadow-lg w-full"
        @click="openView(layout.id)"
    >      <element-summery
          :element="layout">
      </element-summery>
<!--
      <div
          class="flex flex-wrap flex-1 px-4 py-1"
          @click="openView(layout.id)"
      >
        <a href="#" class="hover:underline">
          <h2 class="text-2xl font-bold tracking-normal text-gray-800">
            {{ layout.title}}
          </h2>
        </a>
      </div>
-->
    </div>
  </div>

</template>

<script>
import { computed } from 'vue';
import { debug } from '../../vendors/lib/logging'
import { useRouter } from 'vue-router'
import ElementSummery from "./element-summery.vue";
export default {
  name: "board-list-layouts",
  components: {ElementSummery},
  props: {
    board: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const layouts = computed( () => {
      if (props.board && props.board.layouts) {
        return props.board.layouts()
      }
      return []
    })

    const openView = function(id) {
      debug(`open view ${id}`, 'board-layout')
      router.push({name: 'board', params:{id: props.board.id, layout:id}})
    }
    return {
      layouts,

      openView
    }
  }
}
</script>

<style scoped>

</style>
