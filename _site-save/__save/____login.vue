<template>
  <Card>
    <template #title
    >
      Login
    </template>
    <template #content>
      <panel-error
          :errors="errors"
      ></panel-error>
      <form novalidate @submit.prevent="onsubmit">
        <div>
          <span class="p-float-label">
            <InputText id="username" type="text" v-model="username"/>
          </span>
        </div>
        <div>
          <span class="p-float-label">
            <Password id="password" type="password"/>
          </span>
        </div>

        <div>
          <Button
              label="Sign in"
              class="p-button-text"
              @click="submit"
          ></Button>
          <Button
              label="Forgot password"
              class="p-button-info"
              @click="notYet">
          </Button>
        </div>
      </form>
    </template>
  </Card>
</template>

<script>
import {ref} from "vue";
import {isEmail, minLength} from "../validators";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import PanelError from "../panel-error.vue";
import HeaderPublic from "../header-public.vue";
import InputText from "../input-text.vue";


export default {
  name: "login",
  components: {PanelError, InputText, HeaderPublic},
  setup(props, context) {
    const username = ref('info@toxus.nl')
    const password = ref('123456');
    const errors = ref('');
    const notYet= function() {
      alert('This is not yet implemented. Just contact us')
    }
    const usernameValidator = [
      isEmail(),
      minLength(4)
    ];
    // the login construction
    const store = useStore();
    const router = useRouter()
    const submit = async function() {
      // console.log('submit: ', username.value, password.value)
      try {
        let result = await store.dispatch('auth/login', {username: username.value, password: password.value})
        await router.push({name: 'home'})
      } catch (e) {
        errors.value = e.message
      }
    };
    return {
      username,
      usernameValidator,
      password,
      notYet,
      submit,
      errors
    }
  }
}
</script>

<style scoped>

</style>
