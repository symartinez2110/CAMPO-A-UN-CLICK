<!-- src/views/dashboard/UsuariosCrud.vue -->
<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

const { get, post } = useApi();

const showForm = ref(false);
const usuarios = ref([]);

const nuevoUsuario = ref({
  nombre: "",
  email: "",
  password: "",
  rol: "campesino"
});

// Cargar usuarios
async function cargarUsuarios() {
  try {
    const data = await get("/usuarios");
    usuarios.value = data;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
}

// Guardar nuevo usuario
async function guardarUsuario() {
  if (!nuevoUsuario.value.nombre || !nuevoUsuario.value.email || !nuevoUsuario.value.password) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    await post("/usuarios", nuevoUsuario.value);
    await cargarUsuarios();
    showForm.value = false;
    nuevoUsuario.value = { nombre: "", email: "", password: "", rol: "campesino" };
  } catch (error) {
    console.error("Error al guardar usuario:", error);
  }
}

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div>
    <h2>Gestión de Usuarios</h2>

    <!-- Botón para mostrar formulario -->
    <button class="btn-crear" @click="showForm = !showForm">
      {{ showForm ? "Cancelar" : "Crear Usuario" }}
    </button>

    <!-- Formulario de creación -->
    <div v-if="showForm" class="form-container">
      <h3>Nuevo Usuario</h3>
      <form @submit.prevent="guardarUsuario">
        <label>Nombre:</label>
        <input v-model="nuevoUsuario.nombre" type="text" required />

        <label>Email:</label>
        <input v-model="nuevoUsuario.email" type="email" required />

        <label>Password:</label>
        <input v-model="nuevoUsuario.password" type="password" required />

        <label>Rol:</label>
        <select v-model="nuevoUsuario.rol">
          <option value="campesino">Campesino</option>
          <option value="comprador">Comprador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" class="btn-guardar">Guardar</button>
      </form>
    </div>

    <!-- Tabla de usuarios -->
    <table class="tabla-productos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.id_usuario">
          <td>{{ u.id_usuario }}</td>
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.rol }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 15px;
}

.btn-crear {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 15px;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-crear:hover {
  background: #45a049;
}

.form-container {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

label {
  display: block;
  margin-top: 10px;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.btn-guardar {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-guardar:hover {
  background: #1976d2;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.tabla-productos th,
.tabla-productos td {
  border: 1px solid #c6c2c2;
  padding: 10px;
  text-align: left;
}

.tabla-productos th {
  background: #cceeb3;
}
</style>
