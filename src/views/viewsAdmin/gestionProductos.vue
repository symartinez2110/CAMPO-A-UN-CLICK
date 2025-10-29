<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

const { get, post, put, del } = useApi();

// --- LÓGICA CLAVE: DECODIFICAR JWT Y OBTENER ID DEL USUARIO LOGUEADO ---

// Función auxiliar para decodificar la información del payload del JWT (donde está el ID)
function decodeJwtPayload(token) {
    if (!token) return null;
    try {
        // El JWT es header.payload.signature. Obtenemos el payload (índice 1)
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = parts[1];
        
        // Convertir Base64URL a Base64 estándar para que atob funcione
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        
        // Decodificar Base64 y parsear el JSON
        const decoded = atob(base64);
        const jsonPayload = JSON.parse(decoded);
        
        // Retornamos el campo 'id_usuario' del payload
        return jsonPayload.id_usuario || null; 

    } catch (e) {
        console.error("Error decodificando payload del token:", e);
        return null;
    }
}

function obtenerIdCampesino() {
    try {
        // 1. Obtener el objeto de usuario que contiene el token
        const userJson = localStorage.getItem('user'); 
        
        if (!userJson) {
             console.error("DEBUG ID: La clave 'user' no se encontró en localStorage.");
             return null;
        }
        
        const user = JSON.parse(userJson); 
        const token = user.token; // Obtener el token

        if (!token) {
            console.error("DEBUG ID: El objeto 'user' no contiene el token.");
            return null;
        }
        
        // 2. Extraer el ID del payload del token
        const campesinoId = decodeJwtPayload(token);
        
        if (!campesinoId) {
             console.error("DEBUG ID: El token no contenía un 'id_usuario' válido en su payload.");
        } else {
             console.log(`DEBUG ID: ID de campesino extraído del token correctamente: ${campesinoId}`);
        }
        
        return campesinoId; 

    } catch (e) {
        console.error("DEBUG ID: Error general al obtener ID:", e);
        return null;
    }
}
// --- FIN LÓGICA DE AUTENTICACIÓN ---

// Estados
const showForm = ref(false); 
const showEditForm = ref(false); 
const productos = ref([]);
const categorias = ref([]);

// 🎯 CLAVE: Llama a la función al inicio para establecer el ID
const idCampesinoLogueado = ref(obtenerIdCampesino()); 

// Datos del formulario de creación
const nuevoProducto = ref({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad_disponible: "",
    id_categoria: "",
    id_campesino: idCampesinoLogueado.value // 👈 Asigna el ID obtenido
});

// Datos del formulario de edición
const productoAEditar = ref({
    id_producto: null,
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad_disponible: "",
    id_categoria: "",
    imagenActual: "" 
});

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

// Cargar productos
async function cargarProductos() {
    try {
        // Opcional: Si solo quieres ver los productos de este campesino, cambia la URL a un endpoint filtrado.
        // Por ahora, carga todos, lo cual es común en un panel de control de administrador/campesino.
        const data = await get("/productos"); 
        productos.value = data;
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// Función para guardar producto (USANDO FormData)
async function guardarProducto() {
    // Verificación: Ahora comprueba si idCampesinoLogueado.value tiene un valor (no nulo/cero)
    if (!nuevoProducto.value.nombre || !nuevoProducto.value.precio || !nuevoProducto.value.id_categoria || !idCampesinoLogueado.value) {
        alert("❌ Error: Debes iniciar sesión como campesino y completar todos los campos.");
        return;
    }

    const imagenInput = document.getElementById('imagen_new');
    if (!imagenInput || !imagenInput.files[0]) {
        alert("Debe seleccionar una imagen.");
        return;
    }

    // ✅ CLAVE 1: Crear FormData
    const formData = new FormData();
    formData.append('nombre', nuevoProducto.value.nombre);
    formData.append('descripcion', nuevoProducto.value.descripcion);
    formData.append('precio', nuevoProducto.value.precio);
    formData.append('cantidad_disponible', nuevoProducto.value.cantidad_disponible);
    formData.append('id_categoria', nuevoProducto.value.id_categoria);
    formData.append('id_campesino', idCampesinoLogueado.value); // ✅ Se envía el ID correcto
    formData.append('imagen', imagenInput.files[0]); 

    // ✅ CLAVE 2: Enviar FormData y añadir el header para ignorar Content-Type
    try {
        await post("/productos", formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        
        alert('✅ Producto creado correctamente.');
        showForm.value = false;
        
        // Resetear formulario
        nuevoProducto.value = {
            nombre: "", descripcion: "", precio: "", cantidad_disponible: "",
            id_categoria: "", id_campesino: idCampesinoLogueado.value
        };
        if (imagenInput) imagenInput.value = ''; // Limpiar el input file
        
        await cargarProductos();
    } catch (error) {
        console.error("Error al guardar producto:", error);
        alert(`❌ Error al crear producto: ${error.response?.data?.error || error.message}`);
    }
}

// Lógica de edición
function cargarProductoParaEditar(producto) {
    // Asegura que los campos numéricos se traten como números al cargar
    productoAEditar.value = { 
        ...producto, 
        precio: Number(producto.precio), 
        cantidad_disponible: Number(producto.cantidad_disponible),
        id_categoria: Number(producto.id_categoria), // Asegura que se seleccione la categoría correcta
        imagenActual: producto.imagen 
    }; 
    showEditForm.value = true;
    nuevaImagenAEditar = null; // Resetear la imagen temporal
}

function handleNuevaImagenAEditar(event) {
    nuevaImagenAEditar = event.target.files[0];
}

async function actualizarProducto() {
    if (!productoAEditar.value.nombre || !productoAEditar.value.precio || !productoAEditar.value.id_categoria) {
        alert("Faltan campos obligatorios para la edición.");
        return;
    }
    
    const formData = new FormData();
    formData.append('nombre', productoAEditar.value.nombre);
    formData.append('descripcion', productoAEditar.value.descripcion);
    formData.append('precio', productoAEditar.value.precio);
    formData.append('cantidad_disponible', productoAEditar.value.cantidad_disponible);
    formData.append('id_categoria', productoAEditar.value.id_categoria);
    // id_campesino no se envía en PUT, ya que no se debería cambiar el dueño.

    if (nuevaImagenAEditar) {
        formData.append('imagen', nuevaImagenAEditar);
    }
    
    // ✅ CLAVE: Usar el put con FormData y el Content-Type para evitar problemas.
    try {
        await put(`/productos/${productoAEditar.value.id_producto}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Producto actualizado correctamente.');
        showEditForm.value = false;
        await cargarProductos();
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        alert(`❌ Error al actualizar producto: ${error.response?.data?.error || error.message}`);
    }
}

async function eliminarProducto(id_producto) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
        await del(`/productos/${id_producto}`);
        alert('Producto eliminado correctamente.');
        await cargarProductos();
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert(`Error al eliminar producto: ${error.message}`);
    }
}


onMounted(() => {
    cargarProductos();
    cargarCategorias();
});
</script>
<template>
    <div class="gestion-container">
        <h2>Gestión de Productos</h2>

        <button @click="showForm = true" class="btn-crear">
            Crear Nuevo Producto
        </button>

        <div v-if="showForm" class="form-overlay">
            <div class="form-container">
                <h3>Crear Producto</h3>
                <form @submit.prevent="guardarProducto">
                    
                    <label for="nombre_new">Nombre:</label>
                    <input type="text" id="nombre_new" v-model="nuevoProducto.nombre" required />

                    <label for="descripcion_new">Descripción:</label>
                    <textarea id="descripcion_new" v-model="nuevoProducto.descripcion" required></textarea>

                    <label for="precio_new">Precio:</label>
                    <input type="number" id="precio_new" v-model.number="nuevoProducto.precio" step="0.01" required />

                    <label for="cantidad_disponible_new">Cantidad Disponible:</label>
                    <input type="number" id="cantidad_disponible_new" v-model.number="nuevoProducto.cantidad_disponible" required />

                    <label for="id_categoria_new">Categoría:</label>
                    <select id="id_categoria_new" v-model.number="nuevoProducto.id_categoria" required>
                        <option value="" disabled>Seleccione una categoría</option>
                        <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.id_categoria">
                            {{ categoria.nombre }}
                        </option>
                    </select>
                    
                    <label for="imagen_new">Imagen:</label>
                    <input type="file" id="imagen_new" required accept="image/*" />

                    <button type="submit" class="btn-guardar">Guardar Producto</button>
                    <button type="button" @click="showForm = false" class="btn-cancelar">Cancelar</button>
                </form>
            </div>
        </div>

        <div v-if="showEditForm" class="form-overlay">
            <div class="form-container">
                <h3>Editar Producto #{{ productoAEditar.id_producto }}</h3>
                <form @submit.prevent="actualizarProducto">
                    
                    <label for="nombre_edit">Nombre:</label>
                    <input type="text" id="nombre_edit" v-model="productoAEditar.nombre" required />

                    <label for="descripcion_edit">Descripción:</label>
                    <textarea id="descripcion_edit" v-model="productoAEditar.descripcion" required></textarea>

                    <label for="precio_edit">Precio:</label>
                    <input type="number" id="precio_edit" v-model.number="productoAEditar.precio" step="0.01" required />

                    <label for="cantidad_disponible_edit">Cantidad Disponible:</label>
                    <input type="number" id="cantidad_disponible_edit" v-model.number="productoAEditar.cantidad_disponible" required />

                    <label for="id_categoria_edit">Categoría:</label>
                    <select id="id_categoria_edit" v-model.number="productoAEditar.id_categoria" required>
                        <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.id_categoria">
                            {{ categoria.nombre }}
                        </option>
                    </select>
                    
                    <p>Imagen actual: <strong>{{ productoAEditar.imagenActual }}</strong></p>
                    <label for="imagen_edit">Cambiar Imagen (Opcional):</label>
                    <input type="file" id="imagen_edit" @change="handleNuevaImagenAEditar" accept="image/*" />

                    <button type="submit" class="btn-actualizar">Actualizar Producto</button>
                    <button type="button" @click="showEditForm = false" class="btn-cancelar">Cancelar</button>
                </form>
            </div>
        </div>


        <div class="data-table-section">
            <h3>Productos Registrados</h3>
            <div v-if="productos.length" class="tabla-scroll-container">
                <table class="tabla-productos">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Creador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="producto in productos" :key="producto.id_producto">
                            <td>{{ producto.id_producto }}</td>
                            <td>
                                <img :src="`http://localhost:3000/uploads/${producto.imagen}`" alt="Producto" style="width: 50px; height: 50px; object-fit: cover;">
                            </td>
                            <td>{{ producto.nombre }}</td>
                            <td>${{ producto.precio.toFixed(2) }}</td>
                            <td>{{ producto.cantidad_disponible }}</td>
                            <td>{{ producto.categoria ? producto.categoria.nombre : 'N/A' }}</td>
                            <td>{{ producto.campesino ? producto.campesino.Nombre : 'N/A' }}</td> 
                            <td>
                                <button @click="cargarProductoParaEditar(producto)" class="btn-editar">Editar</button>
                                <button @click="eliminarProducto(producto.id_producto)" class="btn-eliminar">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p v-else>No hay productos registrados.</p>
        </div>
    </div>
</template>


<style scoped>
/* Estilos del contenedor principal */
.gestion-container {
    padding: 20px;
    /* 🛑 SOLUCIÓN CLAVE 1: Asegura que el contenedor principal no desborde horizontalmente */
    overflow-x: hidden; 
}

h2 {
    color: #4a8d20; /* Verde oscuro para el título */
    border-bottom: 2px solid #cceeb3;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

/* --- Botones principales de acción --- */
.btn-crear, .btn-cancelar {
    border: none;
    color: white;
    padding: 10px 15px;
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 8px;
    font-weight: bold;
}
.btn-crear {
    background: #64b129;
    margin-right: 10px; 
}
.btn-crear:hover {
    background: #4a8d20;
}
.btn-cancelar {
    background: #7f8c8d;
}
.btn-cancelar:hover {
    background: #5e6b6c;
}

/* --- Formulario Modal/Overlay (Responsivo) --- */
.form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.form-container {
    background: #f2ffe6;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    max-width: 600px;
    width: 90%; /* Responsividad clave */
    max-height: 90vh;
    overflow-y: auto; /* Permite scroll si el formulario es muy largo */
}
.form-container h3 {
    color: #64b129;
    border-bottom: 1px solid #cceeb3;
    padding-bottom: 10px;
    margin-top: 0;
    margin-bottom: 15px;
}
.form-container label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
}
.form-container input,
.form-container textarea,
.form-container select {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    margin-bottom: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    box-sizing: border-box; 
}
.btn-guardar, .btn-actualizar {
    padding: 10px 15px;
    margin-top: 15px;
    border: none;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 10px;
}
.btn-guardar {
    background: #64b129;
}
.btn-guardar:hover {
    background: #4a8d20;
}
.btn-actualizar {
    background: #2980b9; 
}
.btn-actualizar:hover {
    background: #1f6f9c;
}

/* --- Tabla de Productos (Responsiva) --- */
.data-table-section {
    margin-top: 30px;
    background-color: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.data-table-section h3 {
    color: #333;
    margin-top: 0;
}

/* CLAVE: Contenedor de scroll para tablas */
.tabla-scroll-container {
    width: 100%;
    overflow-x: auto; 
}

.tabla-productos {
    width: 100%;
    border-collapse: collapse;
    /* 🛠️ AJUSTE 2: Reducido de 800px a 700px para más flexibilidad en tablets */
    min-width: 700px; 
    margin-top: 10px;
}

.tabla-productos th,
.tabla-productos td {
    border: 1px solid #ddd;
    padding: 10px 8px; 
    text-align: center;
    font-size: 0.9rem;
    vertical-align: middle;
}
.tabla-productos th {
    background: #cceeb3;
    font-weight: bold;
    color: #333;
}
.tabla-productos td:nth-child(2) img { /* Estilo para la imagen del producto */
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
}

/* Botones de acción en la tabla */
.btn-editar, .btn-eliminar {
    margin: 3px;
    padding: 5px 8px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 0.8rem;
    white-space: nowrap; 
}
.btn-editar {
    background: #f1c40f; 
    color: black;
}
.btn-eliminar {
    background: #e74c3c; 
    color: white;
}
.btn-editar:hover {
    background: #e0b40e;
}
.btn-eliminar:hover {
    background: #c0392b;
}

/* --- Media Queries (Móviles) --- */
@media (max-width: 768px) {
    .gestion-container {
        padding: 10px;
    }
    
    .form-container {
        padding: 20px;
        width: 95%; 
    }
    
    /* Botones de formulario apilados para móviles */
    .form-container form > button {
        display: block;
        width: 100%;
        margin-top: 10px;
        margin-right: 0;
    }

    /* Botón de crear se expande a todo el ancho */
    .gestion-container > button.btn-crear {
        width: 100%;
        box-sizing: border-box;
        margin-right: 0;
    }

    /* Tabla */
    .tabla-productos {
        /* 🛠️ AJUSTE 3: Reducido de 650px a 580px para dar más margen en móviles */
        min-width: 580px; 
    }

    .tabla-productos th,
    .tabla-productos td {
        padding: 8px 5px;
        font-size: 0.8rem;
    }

    .tabla-productos td:nth-child(2) img {
        width: 40px;
        height: 40px;
    }

    /* Ajuste de botones de tabla: apilados verticalmente */
    .tabla-productos td:last-child {
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
    }
    .btn-editar, .btn-eliminar {
        width: 80%; /* Hacer que los botones de acción sean más anchos */
        margin: 0;
        font-size: 0.75rem;
    }
}
</style>