<script setup>
import { ref, onMounted } from "vue";
// Aseguramos que 'put' y 'del' (DELETE) estén disponibles
import useApi from "../../componsables/useApi";
const { get, post, put, del } = useApi();

const showForm = ref(false);
const showEditForm = ref(false); // 👈 Estado para el formulario de edición
const categorias = ref([]);

const nuevaCategoria = ref({
  nombre: "",
  descripcion: ""
});

// 👈 Estado para la edición
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

// 👈 Lógica para abrir el formulario de edición
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

// 👈 Actualizar categoría (Petición PUT)
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

// 👈 Eliminar categoría (Petición DELETE)
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
  <div class="gestion-container">
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

    <div class="tabla-scroll-container">
        <table class="tabla-productos">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th> 
                </tr>
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
  </div>
</template>

<style scoped>
/* Estilos del contenedor principal (Añadido para control de desbordamiento) */
.gestion-container {
    padding: 20px;
    overflow-x: hidden; /* Evita el scroll horizontal indeseado del componente */
}

h2 {
    color: #4a8d20; /* Color que armoniza con los estilos anteriores (Verde oscuro) */
    border-bottom: 2px solid #cceeb3;
    padding-bottom: 10px;
    margin-bottom: 20px; 
}

/* Botones principales de acción */
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
    max-width: 600px; /* Limita el ancho del formulario */
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
    box-sizing: border-box; 
}

.btn-guardar {
    background: #2196f3;
    color: white;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 10px; 
}

.btn-guardar:hover {
    background: #1976d2;
}

.btn-actualizar {
    background: #00bcd4;
    color: white;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 10px; 
}

.btn-actualizar:hover {
    background: #0097a7;
}

/* CLAVE: Contenedor de scroll para tablas */
.tabla-scroll-container {
    width: 100%;
    overflow-x: auto; 
    margin-top: 20px;
}

.tabla-productos {
    width: 100%;
    border-collapse: collapse;
    /* Ancho mínimo para forzar scroll en móviles */
    min-width: 600px; 
}

.tabla-productos th,
.tabla-productos td {
    border: 1px solid #c4c3c3;
    padding: 10px;
    text-align: left;
    font-size: 0.9em;
}

.tabla-productos th {
    background: #cceeb3;
}

/* Estilos para botones de acción en la tabla */
.btn-editar, .btn-eliminar {
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 3px;
    font-size: 0.9em;
    white-space: nowrap; /* Evita que el texto de los botones se rompa */
}

.btn-editar {
    background: #ffc107;
    color: #333;
    margin-right: 5px;
}

.btn-editar:hover {
    background: #ffb300;
}

.btn-eliminar {
    background: #f44336;
    color: white;
}

.btn-eliminar:hover {
    background: #d32f2f;
}

/* --- Media Queries (Móviles) --- */
@media (max-width: 768px) {
    .gestion-container {
        padding: 10px;
    }
    
    /* Botones de formulario apilados para móviles */
    .form-container form button {
        display: block;
        width: 100%;
        margin-top: 10px;
        margin-right: 0;
    }

    /* Botones principales se expanden a todo el ancho */
    .gestion-container > button {
        width: 100%;
        box-sizing: border-box;
        margin-right: 0;
        margin-bottom: 10px;
    }
    
    /* Ajuste de botones de tabla: apilados verticalmente */
    .tabla-productos td:last-child {
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
        padding: 5px; /* Reducir padding de la celda de acciones */
    }
    
    .btn-editar, .btn-eliminar {
        width: 100%; /* Los botones ocupan todo el ancho disponible en la celda */
        margin: 0;
        font-size: 0.8rem;
        padding: 7px;
    }
}
</style>