<template>
  <div class="">
    <img v-svg-inline class="icon" src="../assets/icons/element-file.svg"> {{summery.title}}
  </div>
</template>

<script>
import {computed} from "vue";

export default {
  name: "element-summery",
  props: {
    element: {
      type: Object,
      required: true
    }
  },
  emits:['open', 'edit', 'delete'],
  setup(props) {
    const summery = computed(() => {
      if (props.element) {
        return props.element.summery()
      }
      return {}
    })
    return {
      summery
    }
  }
}
</script>

<style scoped>

</style>
