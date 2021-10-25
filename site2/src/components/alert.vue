<template>
  <div v-if="message && message.length"
      :class="background()" role="alert"

  >
    <p class="font-bold mb-4">{{ title }}</p>
    <p><span v-html=" message"></span></p>
  </div>
</template>

<script>
export default {
  name: "alert",
  props: {
    message: {
      type: String
    },
    title: {
      type: String
    },
    type: {
      type: String,
      default: 'error'
    }
  },
  setup(props) {
    console.log([props])
    const background = () => {
      let color = 'red'
      switch (props.type) {
        case 'warn':
          color = 'green';
          break;
      }
      return `bg-${color}-100 border-l-4 border-${color}-500 text-${color}-700 p-4 rounded-md mt-4`
    }
    return {
      background
    }
  }
}
</script>

<style scoped>

</style>
