<template>
  <Card style="width: 25rem; margin-bottom: 2em">
    <template #title>
      general
    </template>
    <template #content>
      <div class="label">Title</div>
      <div class="content">{{ record.title}}</div>
    </template>
  </Card>

  The general panel {{record.title}}
</template>

<script>
export default {
  name: "art-panel-general",
  props: {
    record: Object
  },
  setup() {
    return {

    }
  }
}
</script>

<style scoped>

</style>
