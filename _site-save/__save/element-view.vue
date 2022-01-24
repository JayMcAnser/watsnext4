<template>
  <div class="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
    <component :is="elementType"
               :element="element"
    >
    </component>

    <slot name="base">
      <element-base
        :element="element">
      </element-base>
    </slot>
  </div>
</template>

<script>
import ElementBase from "./element-base.vue";
import { computed, ref} from 'vue'
import { useStore } from 'vuex';

/**
 * General purpose view of an element. Given ANY element it will show the "proper" information
 */

export default {
  name: "element-view",
  components: {ElementBase},
  props: {
    element: {
      type: Object,
      require: true,
    }
  },
  setup(props) {
    const COMPONENTS = {
      'unknown': () => import('./element-unknown.vue'),
      'text': () => import('./element-view-list.vue'),
      'list': () => import('./element-view-list.vue')
    }
    const store = useStore()
    const board = store.getters['board/active']

    const elementType = computed(() => {
      if (props.element) {
        let type = props.element.type[0];
        if (COMPONENTS[type]) {
          return COMPONENTS[type]
        }
      }
      return COMPONENTS.unknown
    })
    return {
      board,
      elementType
    }
  }
}
</script>

<style scoped>

</style>
