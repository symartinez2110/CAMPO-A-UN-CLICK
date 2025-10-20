<template>
  <div class="register-view-container">
    <div class="register-box">
      <div class="register-form-section">
        <h2>REGISTRARSE</h2>
        <form @submit.prevent="handleRegister">
          <!-- Nombre -->
          <div class="form-group">
            <input type="text" placeholder="Nombre completo" v-model="nombre" required />
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <input type="text" placeholder="Dirección" v-model="direccion" />
          </div>

          <!-- Teléfono -->
          <div class="form-group">
            <input type="text" placeholder="Teléfono" v-model="telefono" required />
          </div>

          <!-- Email -->
          <div class="form-group">
            <input type="email" placeholder="Correo electrónico" v-model="email" required />
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <input type="password" placeholder="Contraseña" v-model="password" required />
          </div>

          <!-- Rol -->
          <div class="form-group">
            <select v-model="rol" required>
              <option disabled value="">Seleccione un rol</option>
              <option value="campesino">Campesino</option>
              <option value="comprador">Comprador</option>
            </select>
          </div>

          <!-- Botón -->
          <div class="form-group">
            <button type="submit" class="button">Registrarse</button>
           <center> <h3 style="color: #5d9266;">¿Ya tienes cuenta? <router-link :to="{name:'loginUser'}" style="color: #9393e9;"> Inicia sesion</router-link></h3></center>
          </div> 
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useApi from '../../componsables/useApi'

const { post } = useApi()
const router = useRouter()

// Variables reactivas
const nombre = ref('')
const direccion = ref('')
const telefono = ref('')
const email = ref('')
const password = ref('')
const rol = ref('')

// Función para registrar
const handleRegister = async () => {
  try {
    const res = await post('/usuarios', {
      Nombre: nombre.value,
      direccion: direccion.value,
      telefono: telefono.value,
      email: email.value,
      contraseña: password.value,
      rol: rol.value
    })

    alert('✅ Registro exitoso, ahora puedes iniciar sesión')
    router.push({ name: 'loginUser' }) // Redirige al login
  } catch (error) {
    alert('❌ Error al registrar usuario: ' + error.message)
  }
}
</script>

<style scoped>
.register-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../../../public/fondo_login.jpg');
  background-size: cover;
  background-position: center;
}

.register-box {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 40px;
  max-width: 500px;
  width: 90%;
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

input,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #B5E491;
  font-size: 1rem;
}

.button {
  width: 100%;
  padding: 12px;
  background-color: #AEF379;
  color: #000;
  border: none;
  border-radius: 150px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #5d9266;
}
</style>
