<!-- src/views/dashboard/CategoriasCrud.vue -->
<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";
const { get, post } = useApi();

const showForm = ref(false);
const categorias = ref([]);

const nuevaCategoria = ref({
  nombre: "",
  descripcion: ""
});

// Cargar categorías
async function cargarCategorias() {
  try {
    const data = await get("/categorias");
    categorias.value = data;
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// Guardar nueva categoría
async function guardarCategoria() {
  if (!nuevaCategoria.value.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  try {
    await post("/categorias", nuevaCategoria.value);
    await cargarCategorias();
    showForm.value = false;
    nuevaCategoria.value = { nombre: "", descripcion: "" };
  } catch (error) {
    console.error("Error al guardar categoría:", error);
  }
}

onMounted(() => {
  cargarCategorias();
});
</script>

<template>
  <div>
    <h2>Gestión de Categorías</h2>

    <!-- Botón para mostrar formulario -->
    <button class="btn-crear" @click="showForm = !showForm">
      {{ showForm ? "Cancelar" : "Crear Categoría" }}
    </button>

    <!-- Formulario de creación -->
    <div v-if="showForm" class="form-container">
      <h3>Nueva Categoría</h3>
      <form @submit.prevent="guardarCategoria">
        <label>Nombre:</label>
        <input v-model="nuevaCategoria.nombre" type="text" required />

        <label>Descripción:</label>
        <textarea v-model="nuevaCategoria.descripcion"></textarea>

        <button type="submit" class="btn-guardar">Guardar</button>
      </form>
    </div>

    <!-- Tabla de categorías -->
    <table class="tabla-productos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in categorias" :key="c.id_categoria">
          <td>{{ c.id_categoria }}</td>
          <td>{{ c.nombre }}</td>
          <td>{{ c.descripcion }}</td>
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
  border: 1px solid #c4c3c3;
  padding: 10px;
  text-align: left;
}

.tabla-productos th {
  background: #cceeb3;
}
</style>
