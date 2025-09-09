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
         <div class="button"> <router-link :to="{name:'homeUser'}">Acceder</router-link> </div>
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
  color: #5d9266;
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

.button {
  display: flex;
  justify-content: center;
  width: 65%;
  height: 20px;
  margin-left: 26px;
  padding: 12px;
  background-color: #AEF379;
  color: #000;
  border: none;
  border-radius: 150px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
a:-webkit-any-link {
  text-decoration: none;
  color: #000;
}

.button:hover {
  background-color: #5d9266;
}

/* Media query para pantallas pequeñas (móviles) */
@media (max-width: 414px) {
  .login-box {
    flex-direction: column; /* Apila los elementos verticalmente */
    width: 95%; /* Ocupa más ancho en la pantalla para mejor visibilidad */
    max-width: 400px; /* Asegura que no sea demasiado ancho en tablets */
    height: auto; /* La altura se ajusta al contenido */
  }

  .login-image-section {
    border-right: none; /* Elimina la línea divisoria vertical */
    padding: 20px 15px; /* Ajusta el relleno vertical y horizontal */
    margin-left: -34px;
    width: 100%; /* Asegura que ocupe todo el ancho disponible */
  }

  .tractor-image {
    max-width: 60%; /* Ajusta el tamaño del tractor para que no sea muy grande */
  }

  .slogan {
    font-size: 1rem; /* Reduce el tamaño de la fuente del eslogan */
    text-align: center; /* Centra el texto */
  }

  .login-form-section {
    padding: 25px 20px; /* Ajusta el relleno para que haya un buen espacio alrededor del formulario */
    width: 100%; /* Asegura que ocupe todo el ancho disponible */
  }
  
  h2 {
    font-size: 1.3rem; /* Reduce el tamaño del título INICIAR SESION */
    margin-bottom: 25px; /* Ajusta el margen inferior */
    margin-right: 33px;
  }

  input[type="text"],
  input[type="password"]
  {
    padding: 12px; /* Mantener un buen tamaño para los campos y el botón */
    font-size: 1rem; /* Ajustar el tamaño de la fuente */
    margin-bottom: 10px;
  }


}

/* Media query para tablets */
@media (min-width: 415px) and (max-width: 768px) {
  .login-box {
  display: flex;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-width: 900px; /* Incrementamos el ancho máximo */
  width: 90%;
}

  .login-image-section {
    padding: 20px; /* Ajustamos el relleno para que no se vea tan grande */
  }

  .login-form-section {
    padding: 20px; /* Ajustamos el relleno de la sección del formulario */
  }
}
</style>