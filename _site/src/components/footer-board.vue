<template>
  <footer-default>
    <template v-slot:mid
    >

      <div
        @click="add">
        <img
            v-svg-inline  src="../assets/icons/element-add.svg"
            class="icon"

        >
      </div>
    </template>
  </footer-default>
</template>

<script>
import FooterDefault from "./footer-default.vue";
import { debug } from  '../vendors/lib/logging'

export default {
  name: "footer-board",
  components: {FooterDefault},
  emit: ['activate'],
  setup(props, {emit}) {
    const add = function() {
      debug(`show insert panel`)
      emit('activate', 'add')
    }
    return {
      add
    }
  }
}
</script>

<style scoped>

</style>
