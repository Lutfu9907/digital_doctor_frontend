<template>
  <head>
    <title>Giriş Yap</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!--===============================================================================================-->
    <link rel="icon" type="image/png" href="images/icons/favicon.ico" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/bootstrap/css/bootstrap.min.css" />
    <!--===============================================================================================-->
    <link
      rel="stylesheet"
      type="text/css"
      href="fonts/font-awesome-4.7.0/css/font-awesome.min.css"
    />
    <!--===============================================================================================-->
    <link
      rel="stylesheet"
      type="text/css"
      href="fonts/iconic/css/material-design-iconic-font.min.css"
    />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/animate/animate.css" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/css-hamburgers/hamburgers.min.css" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/animsition/css/animsition.min.css" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/select2/select2.min.css" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="vendor/daterangepicker/daterangepicker.css" />
    <!--===============================================================================================-->
    <link rel="stylesheet" type="text/css" href="css/util.css" />
    <link rel="stylesheet" type="text/css" href="css/main.css" />
    <!--===============================================================================================-->
  </head>

  <div class="limiter">
    <div class="container-login100" style="background-image: url('images/bg-01.jpg')">
      <div class="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
        <form class="login100-form validate-form">
          <span class="login100-form-title p-b-49"> Giriş Yap </span>

          <div
            class="wrap-input100 validate-input m-b-23"
            data-validate="Geçerli bir email adresi gerekli"
          >
            <span class="label-input100">Email</span>
            <input
              class="input100"
              type="email"
              v-model="email"
              name="email"
              placeholder="Email adresinizi yazın"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              required
            />
            <span class="focus-input100" data-symbol="&#xf206;"></span>
          </div>

          <div class="wrap-input100 validate-input" data-validate="Password is required">
            <span class="label-input100">Şifre</span>
            <input
              class="input100"
              type="password"
              v-model="password"
              name="pass"
              placeholder="Şifrenizi yazın"
            />
            <span class="focus-input100" data-symbol="&#xf190;"></span>
          </div>

          <div class="text-right p-t-8 p-b-31">
            <a href="#" @click="handlePassword('forgotPassword')"> Şifrenizi mi unuttunuz? </a>
          </div>

          <div class="container-login100-form-btn">
            <div class="wrap-login100-form-btn">
              <div class="login100-form-bgbtn"></div>
              <button class="login100-form-btn" @click.prevent="handleLogin('home')">
                Giriş Yap
              </button>
            </div>
          </div>

          <div class="text-center p-t-8 p-b-31">
            <a> Hesabınız yok mu? </a>
          </div>

          <div class="container-login100-form-btn">
            <div class="wrap-login100-form-btn">
              <div class="login100-form-bgbtn"></div>
              <button class="login100-form-btn" @click.prevent="pushUp('sign-up')">Kayıt Ol</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div id="dropDownSelect1"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: email.value,
      password: password.value
    })

    localStorage.setItem('authToken', response.data.token)

    router.push('/home')
  } catch (error) {
    console.error('Login failed', error)
    alert('Giriş başarısız!')
  }
}

const pushUp = () => {
  router.push('/sign-up')
}

const handlePassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.container-login100-form-btn {
  margin-bottom: 15px;
}
</style>
