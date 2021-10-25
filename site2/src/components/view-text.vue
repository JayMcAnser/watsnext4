<template>
  <div>
    <h3 class="text-sm font-medium text-gray-900">
      {{ label}}
    </h3>
    <div class="mt-1 text-sm text-gray-500">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "view-text",
  props: {
    label: {
      type: String
    }
  }
}
</script>

<style scoped>

</style>
