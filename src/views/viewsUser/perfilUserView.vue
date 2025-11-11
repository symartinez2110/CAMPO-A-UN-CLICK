<script setup>
import { ref, onMounted } from 'vue'
import theHeader from '../../components/theHeader.vue'
// Asumo que tu useApi exporta get y put
import useApi from '../../componsables/useApi' 

// --- ⚙️ Configuración y Estado ---

// ⚠️ IMPORTANTE: Este ID debe ser dinámico (obtenido del estado de sesión/login).
// Lo dejamos fijo en 1 como ejemplo funcional con tu ruta /usuarios/:id.
const idUsuario = ref(1) 

// ✅ Estados reactivos
const usuario = ref({
  Nombre: '',
  direccion: '',
  telefono: '',
  email: ''
})
const usuarioOriginal = ref(null) // Respaldo de datos para el botón Cancelar
const modoEdicion = ref(false) // Controla si se está editando o no
const mensajeEstado = ref('') // Para mostrar mensajes de éxito o error

// ✅ Obtenemos los clientes de API
const { get, put } = useApi() 

//  Funciones de Lógica 

/**
  Alterna entre el modo de visualización y edición.
 */
const alternarModoEdicion = () => {
  if (modoEdicion.value) {
    // Si se está saliendo del modo edición (cancelar), restaurar datos
    if (usuarioOriginal.value) {
      usuario.value = { ...usuarioOriginal.value }
    }
    mensajeEstado.value = 'Edición cancelada.'
  } else {
    // Si se está entrando en modo edición, guardar datos originales
    usuarioOriginal.value = { ...usuario.value }
    mensajeEstado.value = 'Modo Edición activado. Realice los cambios.'
  }
  modoEdicion.value = !modoEdicion.value
}


/**
 *  Envía la solicitud PUT para actualizar los datos del usuario */
const guardarUsuario = async () => {
  mensajeEstado.value = 'Guardando cambios...'
  
  // Datos que enviaremos al backend
  const datosActualizados = {
    Nombre: usuario.value.Nombre,
    direccion: usuario.value.direccion,
    telefono: usuario.value.telefono,
    email: usuario.value.email
  }

  try {
    const url = `/usuarios/${idUsuario.value}` 
    
    // Realizamos la petición PUT a la ruta de tu backend
    await put(url, datosActualizados)
    
    // Si la actualización es exitosa:
    usuarioOriginal.value = { ...usuario.value } // Actualiza el respaldo
    modoEdicion.value = false // Sale del modo edición
    mensajeEstado.value = '✅ ¡Usuario actualizado con éxito!'

  } catch (error) {
    console.error('Error al actualizar el usuario:', error)
    mensajeEstado.value = '❌ Error al actualizar. Revisa la consola.'
  }
}

/**
 *  Carga los datos del usuario usando GET /usuarios/:id.*/
const cargarUsuario = async () => {
  mensajeEstado.value = 'Cargando datos...'
  try {
    // Usamos la ruta específica por ID, que devuelve un solo objeto
    const url = `/usuarios/${idUsuario.value}` 
    const response = await get(url)
    
    //  Corrección: Tu API devuelve el objeto directamente con res.json(usuario)
    const data = response 

    // ✅ Asignamos los campos
    usuario.value = {
      Nombre: data.Nombre || '',
      direccion: data.direccion || '',
      telefono: data.telefono || '',
      email: data.email || ''
    }
    
    usuarioOriginal.value = { ...usuario.value } // Inicializamos el respaldo
    mensajeEstado.value = 'Datos Personales'

  } catch (error) {
    console.error('Error al cargar el usuario:', error)
    mensajeEstado.value = '❌ Error al cargar los datos. Asegúrate que el ID (1) exista.'
  }
}

// Llamamos la función cuando se monte el componente
onMounted(() => {
  cargarUsuario()
})
</script>

<template>
  <div class="main-view-container">
    <theHeader />

    <div class="profile-card">
      <div class="card-header">
        <div class="profile-image">
          <img src="/public/logo.png" alt="Profile" />
        </div>
        
        <button class="edit-button" @click="modoEdicion ? guardarUsuario() : alternarModoEdicion()">
          <span class="edit-icon">
            {{ modoEdicion ? '💾' : '✏️' }}
          </span>
          <span>{{ modoEdicion ? 'GUARDAR' : 'EDITAR' }}</span>
        </button>

        <button v-if="modoEdicion" class="cancel-button" @click="alternarModoEdicion()">
          <span class="edit-icon">❌</span>
          <span>CANCELAR</span>
        </button>
      </div>

      <p class="status-message">{{ mensajeEstado }}</p>

      <form v-if="modoEdicion" @submit.prevent="guardarUsuario" class="data-container">
        
        <div class="data-field">
          <h4>Nombre</h4>
          <input type="text" v-model="usuario.Nombre" required />
        </div>

        <div class="data-field">
          <h4>Dirección</h4>
          <input type="text" v-model="usuario.direccion" required />
        </div>

        <div class="data-field">
          <h4>Teléfono</h4>
          <input type="tel" v-model="usuario.telefono" required />
        </div>

        <div class="data-field">
          <h4>Email</h4>
          <input type="email" v-model="usuario.email" required />
        </div>
      </form>

      <div v-else class="data-container">
        
        <div class="data-field">
          <h4>Nombre</h4>
          <div class="data-value">{{ usuario.Nombre }}</div>
        </div>

        <div class="data-field">
          <h4>Dirección</h4>
          <div class="data-value">{{ usuario.direccion }}</div>
        </div>

        <div class="data-field">
          <h4>Teléfono</h4>
          <div class="data-value">{{ usuario.telefono }}</div>
        </div>

        <div class="data-field">
          <h4>Email</h4>
          <div class="data-value">{{ usuario.email }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --color-primary: #86c679;
  --color-background-card: #ffffff;
  --color-edit-text: #666;
  --color-border: #ddd;
}

.main-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('/public/Fondo_Panel_user.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding-top: 1rem;
  box-sizing: border-box;
}

.profile-card {
  height: 100%;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 80px;
  width: 70%;
  max-width: 900px;
  min-width: 300px;
  text-align: center;
  margin-top: 100px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  margin-bottom: 20px;
}

.profile-image img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--color-background-card);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.edit-button {
  position: absolute;
  top: -10px;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-edit-text);
  font-size: 14px;
}

.cancel-button {
  position: absolute;
  top: 25px; 
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #f44336; /* Rojo para cancelar */
  font-size: 14px;
}

.edit-icon {
  margin-right: 5px;
  font-size: 16px;
}

.data-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 10px;
  margin-top: 20px;
  
}

.data-field {
  background-color: seagreen;
  color: white;
  padding: 15px 20px;
  margin: 20px;
  border-radius: 8px;
  flex: 1 1 calc(60% - 10px);
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
}

.data-field input[type="text"],
.data-field input[type="tel"],
.data-field input[type="email"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box; 
  text-align: center;
  color: #333; /* Color oscuro para el texto */
}

.status-message {
  margin-top: 15px;
  font-weight: bold;
  color: var(--color-edit-text);
  font-size: 20px;
}


@media (max-width: 600px) {
  .data-field {
    flex-basis: 100%;
  }
}
</style>