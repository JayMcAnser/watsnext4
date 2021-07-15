<template>
  <div>
    Hi, this is the watsnext 4.0 layout
  </div>
</template>

<script>
import {useStore} from "vuex";
import {onMounted} from "vue";

export default {
  name: "home",
  setup() {
    const store = useStore();
    onMounted( async() => {
      await store.dispatch('menu/activate', 'home');
    })
    return {

    }
  }
}
</script>

<style scoped>

</style>
