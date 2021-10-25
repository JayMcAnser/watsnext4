<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">{{  title }}</h1>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Replace with your content -->
      <div class="py-4">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-96" >
          <slot></slot>
        </div>
      </div>
      <!-- /End replace -->
    </div>
  </div>
</template>

<script>
export default {
  name: "page-canvas",
  props: {
    title: {
      type: String
    }
  },
  setup(props) {
    return {

    }
  }
}
</script>

<style scoped>

</style>

