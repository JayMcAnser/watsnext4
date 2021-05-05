<template>
  <div
      v-if="errMsg.length"
      class="text-red-500"
      v-html="errMsg">
  </div>
</template>

<script>
import {computed} from 'vue'
export default {
  name: "panel-error",
  props: {
    errors: {
      type: [Array, String]
    }
  },
  setup(props) {
    const errMsg = computed(() =>  {
      if (Array.isArray(props.errors)) {
        return props.errors.filter( (e) => e && e.trim().length > 0).join('<br/>')
      } else {
        return props.errors.trim()
      }
    })
    return {
      errMsg
    }
  }
}
</script>

<style scoped>

</style>
