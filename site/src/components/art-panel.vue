<template>
  <div>
    {{ record.title}}
  </div>
</template>

<script>
export default {
  name: "art-panel",
  props: {
    record: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
