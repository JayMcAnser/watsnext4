<template>
  <div>
    <div
        v-for="element in column.children()" :key="element.id"
    >
      <element-view-list
          :element="column">
      </element-view-list>
      element
    </div>
  </div>
</template>

<script>
/**
 * a board is display in a multi column version.
 * So the element give is type of layout.columns
 *  - the element.children are the columns
 *  - activeColumn = element.children[activeIndex] which is a list of (link, item) of element
 * the elements shown can have extra information in their relation to the board.
 * so the element is {
 *   link: {id},  // currently not used
 *   item: {ElementClass}
 * }
 */
import {ref, computed} from 'vue'
import ElementView from "./element-view.vue";

export default {
  name: "board-layout-grid",
  components: {ElementView},
  props: {
    board: {
      type: Object
    },
    layout: {
      type: Object
    }
  },
  setup(props) {
    const activeColumn = ref(0);
    const children = ref(props.layout.children());
    const column = ref(children.value[0].item);

    const columnHeader = ref(children.value[0].link); // currently nothing

    return {
      activeColumn,
      children,
      column,
      columnHeader
    }
  }
}
</script>

<style scoped>

</style>
