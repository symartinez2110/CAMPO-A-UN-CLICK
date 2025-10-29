<script setup>
import { ref, onMounted } from "vue";
// Asumiendo que useApi también expone 'put' y 'del' (o 'remove')
// Si tu composable usa 'del' para DELETE, ajústalo aquí y en el código.
import useApi from "../../componsables/useApi";

// Asumo que useApi incluye: get, post, put, y del (o delete, pero 'del' es más común para evitar conflicto con palabra reservada)
const { get, post, put, del } = useApi();

const showForm = ref(false);
const showEditForm = ref(false); // Estado para mostrar el formulario de edición
const usuarios = ref([]);

// Estado para la creación de nuevo usuario
const nuevoUsuario = ref({
  nombre: "",
  email: "",
  password: "",
  rol: "campesino"
});

// Estado para la edición de usuario (copia del usuario a editar)
const usuarioAEditar = ref({
  id_usuario: null,
  nombre: "",
  email: "",
  rol: ""
  // La contraseña no se edita aquí por seguridad/simplicidad; se requeriría otro campo si fuera necesario.
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

// Guardar nuevo usuario (Petición POST)
async function guardarUsuario() {
  if (!nuevoUsuario.value.nombre || !nuevoUsuario.value.email || !nuevoUsuario.value.password) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    await post("/usuarios", nuevoUsuario.value);
    await cargarUsuarios();
    showForm.value = false;
    // Resetear el formulario de nuevo usuario
    nuevoUsuario.value = { nombre: "", email: "", password: "", rol: "campesino" };
  } catch (error) {
    console.error("Error al guardar usuario:", error);
  }
}

// Lógica para abrir el formulario de edición (Inicializa usuarioAEditar)
function abrirEdicion(usuario) {
  showEditForm.value = true;
  showForm.value = false; // Oculta el formulario de creación si está visible
  // Copia el objeto para evitar modificar directamente el objeto de la tabla
  usuarioAEditar.value = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };
}

// Actualizar usuario (Petición PUT)
async function actualizarUsuario() {
  if (!usuarioAEditar.value.nombre || !usuarioAEditar.value.email || !usuarioAEditar.value.rol) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    // Se extrae el ID para la URL y se envía el resto del cuerpo
    const id = usuarioAEditar.value.id_usuario;
    // Se crea una copia para evitar enviar el id_usuario en el cuerpo si no lo requiere el backend
    const datosActualizacion = {
        nombre: usuarioAEditar.value.nombre,
        email: usuarioAEditar.value.email,
        rol: usuarioAEditar.value.rol
    };

    await put(`/usuarios/${id}`, datosActualizacion);
    await cargarUsuarios(); // Recargar la lista para reflejar los cambios
    showEditForm.value = false;
    alert(`Usuario ${usuarioAEditar.value.nombre} actualizado con éxito.`);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    alert("Hubo un error al actualizar el usuario.");
  }
}


// Eliminar usuario (Petición DELETE)
async function eliminarUsuario(id_usuario, nombre_usuario) {
  if (confirm(`¿Está seguro de que desea eliminar al usuario ${nombre_usuario} (ID: ${id_usuario})?`)) {
    try {
      // Usando 'del' para la petición DELETE
      await del(`/usuarios/${id_usuario}`);
      await cargarUsuarios(); // Recargar la lista para reflejar los cambios
      alert(`Usuario ${nombre_usuario} eliminado con éxito.`);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Hubo un error al eliminar el usuario.");
    }
  }
}

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div>
    <h2>Gestión de Usuarios</h2>

    <button class="btn-crear" @click="showForm = !showForm; showEditForm = false">
      {{ showForm ? "Cancelar Creación" : "Crear Usuario" }}
    </button>
    
    <button v-if="showEditForm" class="btn-cancelar" @click="showEditForm = false">
      Cancelar Edición
    </button>
    
    <hr v-if="showForm || showEditForm">

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
    
    <div v-if="showEditForm" class="form-container">
      <h3>Editar Usuario: {{ usuarioAEditar.nombre }} (ID: {{ usuarioAEditar.id_usuario }})</h3>
      <form @submit.prevent="actualizarUsuario">
        <label>Nombre:</label>
        <input v-model="usuarioAEditar.nombre" type="text" required />

        <label>Email:</label>
        <input v-model="usuarioAEditar.email" type="email" required />
        
        <label>Rol:</label>
        <select v-model="usuarioAEditar.rol">
          <option value="campesino">Campesino</option>
          <option value="comprador">Comprador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" class="btn-actualizar">Actualizar</button>
      </form>
    </div>
    
    <hr v-if="showForm || showEditForm">

    <table class="tabla-productos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th> </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.id_usuario">
          <td>{{ u.id_usuario }}</td>
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.rol }}</td>
          <td>
            <button class="btn-editar" @click="abrirEdicion(u)">
              Editar
            </button>
            <button class="btn-eliminar" @click="eliminarUsuario(u.id_usuario, u.nombre)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Estilos existentes */
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
  margin-right: 10px; /* Espacio entre botones principales */
}

.btn-crear:hover {
  background: #45a049;
}

.btn-cancelar {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-cancelar:hover {
  background: #d32f2f;
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

/* Estilos para botones de acción en la tabla */
.btn-editar {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.9em;
}

.btn-editar:hover {
  background: #ffb300;
}

.btn-eliminar {
  background: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9em;
}

.btn-eliminar:hover {
  background: #d32f2f;
}

.btn-actualizar {
  background: #00bcd4; /* Color diferente para distinguir de guardar */
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-actualizar:hover {
  background: #0097a7;
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