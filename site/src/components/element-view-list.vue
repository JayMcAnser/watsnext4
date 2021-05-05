<template>
  <div>
    LIST
    <div
        v-for="child in children" :key="child.id"
    >
      <element-view
          :elementLink="child.item">
      </element-view>
    </div>
  </div>
</template>

<script>

import {ref} from "vue";
import ElementView from "./element-view.vue";

/**
 * a list of elements. Uses it's children to show
 */
export default {
  name: "element-view-list",
  components: {ElementView},
  props: {
    element: {
      type: Object
    }
  },
  setup(props) {
    const children = ref(props.layout.children());
    return {
      children
    }
  }
}
</script>

<style scoped>

</style>
