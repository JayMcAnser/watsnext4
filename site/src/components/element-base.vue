<template>
  <div>Show meta data of element</div>
</template>

<script>
export default {
  name: "element-base",
  props: {
    element: {
      type: Object,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, event) {
    return {

    }
  }
}
</script>

<style scoped>

</style>
