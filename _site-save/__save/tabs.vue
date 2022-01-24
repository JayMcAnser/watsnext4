<template>
  <div class="w-full">
    <ul class="flex mb-0 list-none flex-wrap flex-row">
      <li class="-mb-px last:mr-0 flex-auto text-center"
          v-for="item in items" :key="items.id" >
        <a class="text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal"
           v-on:click="toggleTabs(item.id)"
           v-bind:class="{'text-pink-600 bg-white': active !== item.id, 'text-white bg-pink-600': active === item.id}">
          <i class="fas fa-space-shuttle text-base mr-1"></i>{{item.caption}}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: "tabs",
  props: {
    items: {        // array of {id, caption == non translated key version, icon}
      type: Array,
      default: []
    },
    active: {
      type: [String, Number],
      default: ''
    }
  },
  emits: [
    'changed'
  ],
  setup(props, context) {
    // const openTab = ref(props.items && props.items.length ? props.items[0].id : '');
    // console.log('props:', props, 'id:', openTab);
    if (props.active === '') {
      props.active = props.items && props.items.length ? props.items[0].id : '';
    }
    const toggleTabs = function(tabId){
      context.emit('changed', {id: tabId})
    }

    return {
      toggleTabs,
    }
  }
}
</script>

<style scoped>

</style>
