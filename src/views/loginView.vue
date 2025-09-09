<template>
  <div class="login-view-container">
    <div class="login-box">
      <div class="login-image-section">
        <img src="/public/Imagen_login.png" alt="Campo a un click" class="tractor-image" />
        
      </div>
      <div class="login-form-section">
        <h2>INICIAR SESION</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input type="text" placeholder="usuario" v-model="username" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="contraseña" v-model="password" required />
          </div>
          <button type="submit">Acceder</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importa Pinia y Axios si los necesitas más adelante
// import { useAuthStore } from '@/stores/auth';
// import axios from 'axios';

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
  // Lógica de autenticación: aquí se haría la llamada a la API
  console.log('Usuario:', username.value);
  console.log('Contraseña:', password.value);
  
  // Por ahora, solo simularemos el login y redirigiremos a la página principal
  router.push({ name: 'home' });
};
</script>

<style scoped>
.login-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('/public/fondo_login.jpg');
  background-size: cover;
  background-position: center;
}

.login-box {
  display: flex;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-width: 700px;
  width: 90%;
  height: 420px;
}

.login-image-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.tractor-image {
  max-width: 100%;
  height: auto;
  margin-left: 30px;
  margin-bottom: 10px;
  border: 4px #dfdede solid;
}

.slogan {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #333;
  font-size: 1.2rem;
}

.login-form-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.5rem;
  color: #555;
  letter-spacing: 1px;
}

.form-group {
  margin-bottom: 20px;
}

input[type="text"],
input[type="password"] {
  width: 80%;
  margin-left: 10px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #B5E491;
  font-size: 1rem;
}

input::placeholder {
  color: #000;
}

button {
  width: 65%;
  height: 40px;
  margin-left: 45px;
  padding: 12px;
  background-color: #AEF379;
  color: #000;
  border: none;
  border-radius: 150px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #5d9266;
}
</style>