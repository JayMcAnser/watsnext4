<template>
  <div class="w-full">
    <div class="mb-3 pt-0">
      <label class="block">
        <span class="text-gray-700">e-mailaddress</span>
        <input placeholder="info@li-ma.nl"
             class="px-3 py-3 placeholder-gray-400 text-gray-600 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:ring w-full" />
      </label>
    </div>
    <div class="mb-3 pt-0">
      <label class="block">
        <span class="text-gray-700">password</span>
        <input type="password" placeholder=""
               class="px-3 py-3 placeholder-gray-400 text-gray-600 relative bg-white bg-white rounded text-sm border border-gray-400 outline-none focus:outline-none focus:ring w-full" />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: "form-login",
  props: {
    username,
    password
  }
}
</script>

<style scoped>

</style>
