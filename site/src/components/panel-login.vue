<template>
  <div>
    <Card>
      <template #header>
        <img :src="logo"/>
      </template>
      <template #title
      >
       <!-- Login -->
      </template>
      <template #content>
        <Message severity="error"
                 :closable="false"
                 v-if="error.length"
        >
          {{ error }}
        </Message>

        <form novalidate @submit.prevent="onsubmit">
          <div class="field">
            <span>
              <h5>E-mail</h5>
              <InputText
                  id="username"
                  type="text"
                  @keydown="clearError"
                  v-model="username"/>
            </span>
          </div>
          <div class="field full">
            <span >
              <h5>Password</h5>
              <Password
                  :feedback="false"
                  id="password"
                  @keydown="clearError"
                  toggleMask
                  v-model="password"
                  type="password"/>
            </span>
          </div>

          <div class="field">
            <div class="p-d-flex p-jc-between">
              <div>
                <Button
                  label="Sign in"
                  class="p-button-success"
                  @click="submit">
                </Button>
              </div>
              <div>
                <Button
                  label="Forgot password"
                  class="p-button-outlined"
                  @click="notYet">
              </Button>
              </div>
            </div>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script>
import {debug} from "../vendors/lib/logging";
import {ref} from 'vue'
import {useStore} from 'vuex';
import logo from '../assets/images/logo2.png'
import PanelError from './panel-error.vue'
export default {
  name: "panel-login",
  components: {
    PanelError
  },
  setup(props, {emit}) {
    const  username = ref('');
    const password = ref('')
    const error = ref('');
    const store = useStore()

    const submit = async function() {
      error.value = ''
      username.value = username.value.trim();
      password.value = password.value.trim();
      if (password.value.length === 0 || username.value.length === 0) {
        error.value = 'E-mail and password are required'
        return false
      }
      try {
        await store.dispatch('auth/login', {username: username.value, password: password.value})
      } catch (e) {
        error.value = e.message;
      }
    };
    const notYet = function() {
      error.value = 'This is not yet implemented'
    }
    const clearError = function() {
      error.value = ''
    }

    return {
      username,
      password,
      error,
      submit,
      clearError,
      notYet,
      logo
    }
  }
}
</script>

<style >
  .field {
    padding: 1rem;
  }
  .full, .full input, .full .p-password {
    width: 100%
  }
</style>
