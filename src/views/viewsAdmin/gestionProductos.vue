<!-- src/views/dashboard/ProductosCrud.vue -->
<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

const { get, post } = useApi();

// Estados
const showForm = ref(false); 
const productos = ref([]);
const categorias = ref([]);

// Datos del formulario
const nuevoProducto = ref({
  nombre: "",
  descripcion: "",
  precio: null,
  cantidad: null,
  categoriaId: null, // ahora guardamos el id de la categoría
  imagen: null
});

// Cargar categorías desde el backend
async function cargarCategorias() {
  try {
    const data = await get("/categorias");
    categorias.value = data;
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// Cargar productos desde el backend
async function cargarProductos() {
  try {
    const data = await get("/productos");
    productos.value = data;
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Manejo de archivo (solo PNG y JPG)
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
    nuevoProducto.value.imagen = file;
  } else {
    alert("Solo se permiten imágenes PNG o JPG");
    event.target.value = null;
  }
}

// Simular envío de producto
async function guardarProducto() {
  if (!nuevoProducto.value.nombre || !nuevoProducto.value.categoriaId) {
    alert("El nombre y la categoría son obligatorios");
    return;
  }

  // Preparar formData para enviar archivo e info
  const formData = new FormData();
  formData.append("nombre", nuevoProducto.value.nombre);
  formData.append("descripcion", nuevoProducto.value.descripcion);
  formData.append("precio", nuevoProducto.value.precio);
  formData.append("cantidad_disponible", nuevoProducto.value.cantidad);
  formData.append("id_categoria", nuevoProducto.value.categoriaId);
  if (nuevoProducto.value.imagen) {
    formData.append("imagen", nuevoProducto.value.imagen);
  }

  try {
    await post("/productos", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    await cargarProductos();
    showForm.value = false;
    nuevoProducto.value = { nombre: "", descripcion: "", precio: null, cantidad: null, categoriaId: null, imagen: null };
  } catch (error) {
    console.error("Error al guardar producto:", error);
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarCategorias();
  cargarProductos();
});
</script>

<template>
  <div>
    <h2>Gestión de Productos</h2>

    <!-- Botón para mostrar formulario -->
    <button class="btn-crear" @click="showForm = !showForm">
      {{ showForm ? "Cancelar" : "Crear Producto" }}
    </button>

    <!-- Formulario de creación -->
    <div v-if="showForm" class="form-container">
      <h3>Nuevo Producto</h3>
      <form @submit.prevent="guardarProducto">
        <label>Nombre:</label>
        <input v-model="nuevoProducto.nombre" type="text" required />

        <label>Descripción:</label>
        <textarea v-model="nuevoProducto.descripcion"></textarea>

        <label>Precio:</label>
        <input v-model="nuevoProducto.precio" type="number" required />

        <label>Cantidad disponible:</label>
        <input v-model="nuevoProducto.cantidad" type="number" required />

        <label>Categoría:</label>
        <select v-model="nuevoProducto.categoriaId" required>
          <option disabled value="">Selecciona una categoría</option>
          <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">
            {{ c.nombre }}
          </option>
        </select>

        <label>Imagen (PNG o JPG):</label>
        <input type="file" accept="image/png, image/jpeg" @change="handleFileUpload" />

        <button type="submit" class="btn-guardar">Guardar</button>
      </form>
    </div>

    <!-- Tabla de productos -->
    <table class="tabla-productos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productos" :key="p.id_producto">
          <td>{{ p.id_producto }}</td>
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria?.nombre }}</td>
          <td>{{ p.precio }}</td>
          <td>{{ p.cantidad_disponible }}</td>
          <td>
            <button class="btn-editar">Editar</button>
            <button class="btn-eliminar">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
.btn-crear {
  background: #64b129;
  border: none;
  color: white;
  padding: 10px 15px;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
}
.btn-crear:hover {
  background: #4a8d20;
}

.form-container {
  background: #f2ffe6;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.form-container label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}
.form-container input,
.form-container textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn-guardar {
  margin-top: 15px;
  padding: 10px;
  background: #64b129;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-guardar:hover {
  background: #4a8d20;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.tabla-productos th,
.tabla-productos td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}
.tabla-productos th {
  background: #cceeb3;
}
.btn-editar, .btn-eliminar {
  margin: 0 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}
.btn-editar {
  background: #f1c40f;
  color: black;
}
.btn-eliminar {
  background: #e74c3c;
  color: white;
}
</style>
