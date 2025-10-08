<script setup>
import { ref, onMounted } from "vue";
// Aseguramos que 'put' y 'del' (DELETE) estén disponibles
import useApi from "../../componsables/useApi";
const { get, post, put, del } = useApi();

const showForm = ref(false);
const showEditForm = ref(false); // 👈 NUEVO: Estado para el formulario de edición
const categorias = ref([]);

const nuevaCategoria = ref({
  nombre: "",
  descripcion: ""
});

// 👈 NUEVO: Estado para la edición
const categoriaAEditar = ref({
    id_categoria: null,
    nombre: "",
    descripcion: ""
});

// Cargar categorías (Sin cambios)
async function cargarCategorias() {
  try {
    const data = await get("/categorias");
    categorias.value = data;
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// Guardar nueva categoría (Sin cambios)
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

// 👈 NUEVO: Lógica para abrir el formulario de edición
function abrirEdicion(categoria) {
    showEditForm.value = true;
    showForm.value = false; // Ocultar el formulario de creación si está visible
    // Copiar datos del objeto de la tabla
    categoriaAEditar.value = {
        id_categoria: categoria.id_categoria,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion
    };
}

// 👈 NUEVO: Actualizar categoría (Petición PUT)
async function actualizarCategoria() {
    if (!categoriaAEditar.value.nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    try {
        const id = categoriaAEditar.value.id_categoria;
        const datosActualizacion = {
            nombre: categoriaAEditar.value.nombre,
            descripcion: categoriaAEditar.value.descripcion
        };

        await put(`/categorias/${id}`, datosActualizacion);
        await cargarCategorias(); // Recargar la lista
        showEditForm.value = false;
        alert(`Categoría ${categoriaAEditar.value.nombre} actualizada.`);
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        alert("Hubo un error al actualizar la categoría.");
    }
}

// 👈 NUEVO: Eliminar categoría (Petición DELETE)
async function eliminarCategoria(id_categoria, nombre_categoria) {
    if (confirm(`¿Está seguro de que desea eliminar la categoría "${nombre_categoria}" (ID: ${id_categoria})?`)) {
        try {
            await del(`/categorias/${id_categoria}`);
            await cargarCategorias(); // Recargar la lista
            alert(`Categoría ${nombre_categoria} eliminada.`);
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            // Mensaje de advertencia si la restricción de clave foránea falla
            alert("Hubo un error al eliminar la categoría. Asegúrese de que no tenga productos asociados.");
        }
    }
}

onMounted(() => {
  cargarCategorias();
});
</script>

<template>
  <div>
    <h2>Gestión de Categorías</h2>

    <button class="btn-crear" @click="showForm = !showForm; showEditForm = false">
      {{ showForm ? "Cancelar Creación" : "Crear Categoría" }}
    </button>
    
    <button v-if="showEditForm" class="btn-cancelar" @click="showEditForm = false">
      Cancelar Edición
    </button>
    
    <hr v-if="showForm || showEditForm">

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

    <div v-if="showEditForm" class="form-container">
        <h3>Editar Categoría: {{ categoriaAEditar.nombre }} (ID: {{ categoriaAEditar.id_categoria }})</h3>
        <form @submit.prevent="actualizarCategoria">
            <label>Nombre:</label>
            <input v-model="categoriaAEditar.nombre" type="text" required />

            <label>Descripción:</label>
            <textarea v-model="categoriaAEditar.descripcion"></textarea>

            <button type="submit" class="btn-actualizar">Actualizar</button>
        </form>
    </div>
    
    <hr v-if="showForm || showEditForm">

    <table class="tabla-productos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acciones</th> </tr>
      </thead>
      <tbody>
        <tr v-for="c in categorias" :key="c.id_categoria">
          <td>{{ c.id_categoria }}</td>
          <td>{{ c.nombre }}</td>
          <td>{{ c.descripcion }}</td>
          <td>
            <button class="btn-editar" @click="abrirEdicion(c)">Editar</button>
            <button class="btn-eliminar" @click="eliminarCategoria(c.id_categoria, c.nombre)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 15px;
}

/* Modificado para dejar espacio para el botón de cancelar */
.btn-crear {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 15px;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 10px;
}

.btn-crear:hover {
  background: #45a049;
}

/* 👈 NUEVO: Estilo para botón de cancelar */
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
  box-sizing: border-box; /* Asegura que el padding no desborde el ancho */
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

/* 👈 NUEVO: Estilo para botón de actualizar */
.btn-actualizar {
  background: #00bcd4;
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
  border: 1px solid #c4c3c3;
  padding: 10px;
  text-align: left;
}

.tabla-productos th {
  background: #cceeb3;
}

/* 👈 NUEVO: Estilos para botones de acción en la tabla */
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
</style>