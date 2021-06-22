<template>
  <div>
    <header-public
        :hide-login="true"
    >
      WatsNext 4.0
    </header-public>
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
      <panel-error
          :errors="errors"
      ></panel-error>
      <form novalidate @submit.prevent="onsubmit">
        <div class="mb-4">
          <!--
          <InputText
              label="Username"
              v-model="username"
              placeholder="email address"
              type="text"
              :validators="usernameValidator"
              @focus="errors = ''"
          >
          </InputText>
          -->
          <o-field
              label="Username"
          >
            <o-input v-model="username"></o-input>
          </o-field>
        </div>
        <div class="mb-4">
          <!--
          <InputText
              label="Password"
              v-model="password"
              placeholder="password"
              type="password"
              @focus="errors = ''"
          >
          </InputText>
          -->
          <o-field
              label="Password"
          >
            <o-input
                type="password"
                v-model="password"
                password-reveal
            > </o-input>
          </o-field>
        </div>


        <div class="flex items-center justify-between">
          <button type="button" class="btn"><span class=""><!----><span>Add recipe</span><!----></span></button>

          <o-button variant="primary"
                  @click="submit"
          >
            Sign In
          </o-button>
          <o-button
              @click="notYet"
          >
            Forgot Password?
          </o-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {ref} from "vue";
import {isEmail, minLength} from "./validators";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import PanelError from "../components/panel-error.vue";
import HeaderPublic from "../components/header-public.vue";
import InputText from "../components/input-text.vue";


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
