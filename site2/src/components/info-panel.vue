<template>
  <div class="w-full m-3 md:w-1/2 lg:w-1/3 bg-color border-2 border-gray-200 rounded-lg">
    <h2 class="text-lg font-medium bg-gray-200 p-2">{{ title }}</h2>
    <div class="p-2">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "info-panel",
  props: {
    title: {
      type: String
    }
  }
}
</script>

<style scoped>

</style>
