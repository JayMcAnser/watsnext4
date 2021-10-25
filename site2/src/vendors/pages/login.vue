<template>
  <div class="login">
    <login-form></login-form>
  </div>
</template>

<script>
  
import LoginForm from '../components/login-form.vue';
  
export default {
  name: 'Login',
  components: {       
    LoginForm
  }
}
</script>