

import { ref, watch } from "vue";

export default function (startVal, validators, onValidate) {
  let input = ref(startVal);
  let errors = ref([]);
  watch(input, value => {
    errors.value = validators.map(validator => validator(value))
    onValidate(value);
  });

  return {
    input,
    errors
  }
}
