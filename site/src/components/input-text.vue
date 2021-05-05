<template>
  <div>
    <label class="block text-grey-darker text-sm font-bold mb-2" :for="label">
      {{ label }}
    </label>
    <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
        :id="label"
        :name="label"
        @blur="showErrors"
        @focus="$emit('focus')"
        v-model="input"
        :type="type"
        :placeholder="placeholder" />
    <panel-error :errors="errors" v-if="showPanel"></panel-error>
  </div>
</template>
<script>
/**
 * original from: https://vuejsdevelopers.com/2020/03/31/vue-js-form-composition-api/
 */
import {ref} from 'vue';
import useInputValidator from "./validators/useInputValidator";
// import { minLength } from "./validators/min-length";
import PanelError from "./panel-error.vue";

export default {
  name: 'InputText',
  components: {PanelError},
  props: {
    modelValue: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String
    },
    placeholder: {
      type: String,
      default: ''
    },
    validators: {
      type: Array,
      default: []
    }
  },
  setup(props, {emit}) {
    // console.log('input-text', props.modelValue)
    const { input, errors } = useInputValidator(
        props.modelValue,
        props.validators,
        value => emit('update:modelValue', value)
    );
    const showPanel = ref(false)
    const showErrors = function() {
      showPanel.value = errors.value.length > 0
      console.log('check errors', errors, showPanel.value)
      emit('blur')
    }

    return {
      input,
      errors,
      showErrors,
      showPanel
    }
  }
}
</script>
