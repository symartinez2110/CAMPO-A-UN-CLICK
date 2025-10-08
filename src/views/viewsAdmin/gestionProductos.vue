<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

// Asumo que useApi incluye: get, post, put, y del
const { get, post, put, del } = useApi();

// Estados
const showForm = ref(false); // Formulario de creación
const showEditForm = ref(false); // Formulario de edición
const productos = ref([]);
const categorias = ref([]);

// Datos del formulario de creación
const nuevoProducto = ref({
  nombre: "",
  descripcion: "",
  precio: "",
  cantidad_disponible: "",
  id_categoria: "",
  imagen: ""
});

// Datos del formulario de edición
const productoAEditar = ref({
  id_producto: null,
  nombre: "",
  descripcion: "",
  precio: "",
  cantidad_disponible: "",
  id_categoria: "",
  // No necesitamos el campo 'imagen' aquí, ya que se maneja por separado si se sube una nueva.
  imagenActual: "" // Para mostrar el nombre de la imagen actual
});

// Variable temporal para la nueva imagen en edición
let nuevaImagenAEditar = null;

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

// Manejo de archivo (para el formulario de CREACIÓN)
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
    nuevoProducto.value.imagen = file;
  } else {
    alert("Solo se permiten imágenes PNG o JPG");
    event.target.value = null;
    nuevoProducto.value.imagen = "";
  }
}

// Manejo de archivo (para el formulario de EDICIÓN)
function handleEditFileUpload(event) {
  const file = event.target.files[0];
  if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
    nuevaImagenAEditar = file;
  } else {
    alert("Solo se permiten imágenes PNG o JPG");
    event.target.value = null;
    nuevaImagenAEditar = null;
  }
}

// Guardar producto (POST)
async function guardarProducto() {
  if (!nuevoProducto.value.nombre || !nuevoProducto.value.id_categoria) {
    alert("El nombre y la categoría son obligatorios");
    return;
  }
  
  // Debe haber una imagen en la creación
  if (!nuevoProducto.value.imagen) {
      alert("La imagen es obligatoria para el nuevo producto");
      return;
  }

  // Preparar formData
  const formData = new FormData();
  formData.append("nombre", nuevoProducto.value.nombre);
  formData.append("descripcion", nuevoProducto.value.descripcion);
  formData.append("precio", nuevoProducto.value.precio);
  formData.append("cantidad_disponible", nuevoProducto.value.cantidad_disponible);
  formData.append("id_categoria", nuevoProducto.value.id_categoria);
  formData.append("id_campesino", 1); // 🔹 Temporalmente, mientras no hay autenticación.

  if (nuevoProducto.value.imagen) {
    formData.append("imagen", nuevoProducto.value.imagen);
  }

  try {
    await post("/productos", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    await cargarProductos();
    showForm.value = false;
    nuevoProducto.value = {
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad_disponible: "",
      id_categoria: "",
      imagen: ""
    };
  } catch (error) {
    console.error("Error al guardar producto:", error);
    alert("Error al guardar producto: " + (error.response?.data?.error || error.message));
  }
}


// Lógica para abrir el formulario de edición (Inicializa productoAEditar)
function abrirEdicion(producto) {
  showEditForm.value = true;
  showForm.value = false; // Ocultar el de creación
  nuevaImagenAEditar = null; // Resetear la imagen temporal

  // Copia el objeto y formatea el precio y cantidad
  productoAEditar.value = {
    id_producto: producto.id_producto,
    nombre: producto.nombre,
    descripcion: producto.descripcion || "",
    precio: producto.precio,
    cantidad_disponible: producto.cantidad_disponible,
    id_categoria: producto.categoria?.id_categoria || producto.id_categoria, // Asegura que se tome el ID
    imagenActual: producto.imagen || "No hay imagen registrada"
  };
}

// Actualizar producto (PUT)
async function actualizarProducto() {
  if (!productoAEditar.value.nombre || !productoAEditar.value.id_categoria) {
    alert("El nombre y la categoría son obligatorios");
    return;
  }

  const id = productoAEditar.value.id_producto;
  const formData = new FormData();
  
  // Agregar campos al FormData
  formData.append("nombre", productoAEditar.value.nombre);
  formData.append("descripcion", productoAEditar.value.descripcion);
  formData.append("precio", productoAEditar.value.precio);
  formData.append("cantidad_disponible", productoAEditar.value.cantidad_disponible);
  formData.append("id_categoria", productoAEditar.value.id_categoria);
  
  // Si hay una nueva imagen, se añade al FormData
  if (nuevaImagenAEditar) {
    formData.append("imagen", nuevaImagenAEditar);
  }

  try {
    await put(`/productos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    await cargarProductos();
    showEditForm.value = false;
    alert(`Producto ${productoAEditar.value.nombre} actualizado con éxito.`);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    alert("Error al actualizar producto: " + (error.response?.data?.error || error.message));
  }
}


// Eliminar producto (DELETE)
async function eliminarProducto(id_producto, nombre_producto) {
  if (confirm(`¿Está seguro de que desea eliminar el producto "${nombre_producto}" (ID: ${id_producto})?`)) {
    try {
      await del(`/productos/${id_producto}`);
      await cargarProductos();
      alert(`Producto ${nombre_producto} eliminado con éxito.`);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Hubo un error al eliminar el producto.");
    }
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

    <button class="btn-crear" @click="showForm = !showForm; showEditForm = false">
      {{ showForm ? "Cancelar Creación" : "Crear Producto" }}
    </button>
    
    <button v-if="showEditForm" class="btn-cancelar" @click="showEditForm = false">
      Cancelar Edición
    </button>
    
    <hr v-if="showForm || showEditForm">

    <div v-if="showForm" class="form-container">
      <h3>Nuevo Producto</h3>
      <form @submit.prevent="guardarProducto">
        <label>Nombre:</label>
        <input v-model="nuevoProducto.nombre" type="text" required />

        <label>Descripción:</label>
        <textarea v-model="nuevoProducto.descripcion"></textarea>

        <label>Precio:</label>
        <input v-model="nuevoProducto.precio" type="number" step="0.01" required />

        <label>Cantidad disponible:</label>
        <input v-model="nuevoProducto.cantidad_disponible" type="number" required />

        <label>Categoría:</label>
        <select v-model="nuevoProducto.id_categoria" required>
          <option disabled value="">Selecciona una categoría</option>
          <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">
            {{ c.nombre }}
          </option>
        </select>

        <label>Imagen (PNG o JPG):</label>
        <input type="file" accept="image/png, image/jpeg" @change="handleFileUpload" required/>

        <button type="submit" class="btn-guardar">Guardar</button>
      </form>
    </div>
    
    <div v-if="showEditForm" class="form-container">
      <h3>Editar Producto: {{ productoAEditar.nombre }} (ID: {{ productoAEditar.id_producto }})</h3>
      <form @submit.prevent="actualizarProducto">
        <label>Nombre:</label>
        <input v-model="productoAEditar.nombre" type="text" required />

        <label>Descripción:</label>
        <textarea v-model="productoAEditar.descripcion"></textarea>

        <label>Precio:</label>
        <input v-model="productoAEditar.precio" type="number" step="0.01" required />

        <label>Cantidad disponible:</label>
        <input v-model="productoAEditar.cantidad_disponible" type="number" required />

        <label>Categoría:</label>
        <select v-model="productoAEditar.id_categoria" required>
          <option disabled value="">Selecciona una categoría</option>
          <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">
            {{ c.nombre }}
          </option>
        </select>

        <label>Imagen Actual:</label>
        <p class="imagen-actual">{{ productoAEditar.imagenActual }}</p>

        <label>Cambiar Imagen (opcional):</label>
        <input type="file" accept="image/png, image/jpeg" @change="handleEditFileUpload" />

        <button type="submit" class="btn-actualizar">Actualizar</button>
      </form>
    </div>
    
    <hr v-if="showForm || showEditForm">

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
            <button class="btn-editar" @click="abrirEdicion(p)">Editar</button>
            <button class="btn-eliminar" @click="eliminarProducto(p.id_producto, p.nombre)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Estilos existentes */
.btn-crear {
  background: #64b129;
  border: none;
  color: white;
  padding: 10px 15px;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
  margin-right: 10px; /* Espacio añadido */
}
.btn-crear:hover {
  background: #4a8d20;
}

/* Nuevo estilo para botón de cancelar */
.btn-cancelar {
  background: #7f8c8d;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 8px;
}
.btn-cancelar:hover {
  background: #5e6b6c;
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
.form-container textarea,
.form-container select { /* Añadido select */
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box; /* Asegura que el padding no desborde el ancho */
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

/* Nuevo estilo para botón de actualizar */
.btn-actualizar {
  margin-top: 15px;
  padding: 10px;
  background: #2980b9; /* Azul distinto para actualizar */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-actualizar:hover {
  background: #1f6f9c;
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
.imagen-actual {
    font-style: italic;
    color: #555;
    margin-bottom: 10px;
}
</style>