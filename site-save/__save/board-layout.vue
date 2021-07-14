<template>
  <div>The specific layout of a board id:[{{layout}}]</div>
  <component
      :is="layoutComponent"
      :board="board"
      :layout="layoutElement"
  >
  </component>
</template>

<script>

import BoardLayoutGrid from "./board-layout-grid.vue";
import {computed } from 'vue';
import {warn} from '../../vendors/lib/logging'
const LAYOUTS = {
  grid: BoardLayoutGrid
}
/**
 * given an board and layout it will display it.
 */
export default {
  name: "board-layout",
  components: {BoardLayoutGrid},
  props: {
    board: {
      type: Object
    },
    layout: {
      type: String
    },
  },
  setup(props) {
    const layoutElement = computed(() => {
      if (props.board) {
        return props.board.element(props.layout)
      }
      return undefined
    })
    const layoutComponent = computed( () => {
      if (props.board) {
        let elm = props.board.element(props.layout)
        if (elm && LAYOUTS[elm.style]) {
            return LAYOUTS[elm.style];
          }
        console.log(elm)
        warn(`unknown layout style: '${elm.style}'`)
      }
      return undefined
    })
    return {
      layoutComponent,
      layoutElement
    }
  }
}
</script>

<style scoped>

</style>
