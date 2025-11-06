<script setup>
import theHeader from '../../components/theHeader.vue';
import { ref, onMounted } from 'vue';
// 🟢 Importamos el composable para las llamadas API
import useApi from "../../componsables/useApi"; 
// 🟢 Importamos el store del carrito
import useCartStore from "../../store/useCartStore"; 

const { get, post } = useApi(); 
// Obtenemos las funciones necesarias del store del carrito:
// - getCompradorId: para saber quién está comprando (desde el JWT)
// - updateCart: para refrescar el estado del carrito (e.g., el icono de la barra de navegación)
const { getCompradorId, updateCart } = useCartStore(); 

// --- ESTADO ---
const categorias = ref([]);      // Almacena la lista de categorías
const isModalOpen = ref(false);  // Controla la visibilidad de la modal
const selectedCategory = ref(null); // Almacena la categoría seleccionada
const productosFiltrados = ref([]); // Almacena los productos de la categoría

// --- CONEXIÓN CON EL BACKEND ---

/**
 * Obtiene todas las categorías desde el endpoint /categorias.
 */
const fetchCategories = async () => {
    try {
        const data = await get("/categorias");
        // Los datos vienen con la forma: { id_categoria, nombre, descripcion }
        categorias.value = data;
    } catch (error) {
        console.error("Error al obtener categorías:", error);
    }
};

/**
 * Obtiene productos filtrados por id_categoria.
 * ASUNCIÓN: El backend de productos acepta el filtro por query parameter.
 */
const fetchProductsByCategory = async (categoryId) => {
    try {
        const url = `/productos?id_categoria=${categoryId}`;
        const data = await get(url);
        // ASUNCIÓN: Los productos tienen id_producto, nombre, precio.
        return data;
    } catch (error) {
        console.error(`Error al obtener productos para categoría ${categoryId}:`, error);
        return [];
    }
};

// --- LÓGICA DE AGREGAR AL CARRITO ---

/**
 * Agrega un producto seleccionado al carrito de compras mediante la API.
 * @param {Object} producto - El objeto del producto a agregar.
 */
async function agregarAlCarrito(producto) {
    const compradorId = getCompradorId();
    if (!compradorId) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        return;
    }

    try {
        const payload = {
            id_comprador: compradorId,
            // 💡 Usamos id_producto, asumiendo que el objeto producto lo contiene
            id_producto: producto.id_producto, 
            cantidad: 1 // Por defecto, agregamos 1 unidad
        };
        
        // 💡 Llama al endpoint POST /carrito
        await post('/carrito', payload);
        
        // Recargamos el carrito globalmente (para actualizar el contador en el Header)
        await updateCart(compradorId); 

        alert(`✅ "${producto.nombre}" agregado al carrito.`); 
        
    } catch (error) {
        // Manejo de errores específicos (ej. falta de stock)
        const errorMessage = error.response?.data?.error || "Error al conectar con el servidor.";
        console.error("Error al agregar al carrito:", errorMessage, error);
        alert(`❌ Error al agregar "${producto.nombre}" al carrito. Detalles: ${errorMessage}`);
    }
}


// --- Manejo de la Modal y Filtros ---

/**
 * Abre la modal y carga los productos de la categoría seleccionada.
 */
const openModal = async (category) => {
    selectedCategory.value = category;
    
    // Llamar a la API usando el id_categoria real
    const products = await fetchProductsByCategory(category.id_categoria);
    productosFiltrados.value = products;
    
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    productosFiltrados.value = [];
    selectedCategory.value = null;
};

// Ejecutar al montar el componente
onMounted(() => {
    fetchCategories();
});
</script>

<template>
    <div>
        <theHeader />
        <div class="panel-central">
            <div class="Productos">
                <h2>CATEGORÍAS DE PRODUCTOS</h2>
            </div>
            
            <div class="contenedores-grid">
                <div 
                    class="contenedor" 
                    v-for="categoria in categorias" 
                    :key="categoria.id_categoria"
                >
                    <div class="nombre">{{ categoria.nombre }}</div>
                    <div class="descripcion">{{ categoria.descripcion }}</div>
                    
                    <button class="btn-ver-productos" @click="openModal(categoria)">
                        Ver Productos
                    </button>
                </div>
            </div>
        </div>

        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <button class="modal-close" @click="closeModal">×</button>
                
                <h3>Productos en {{ selectedCategory?.nombre }}</h3>

                <div v-if="productosFiltrados.length > 0" class="productos-list">
                    <div 
                        class="producto-item" 
                        v-for="producto in productosFiltrados" 
                        :key="producto.id_producto || producto.id"
                    >
                        <div class="producto-detalle">
                            <span class="nombre-producto">{{ producto.nombre }}</span>
                            <span class="precio-producto">${{ producto.precio?.toFixed(2) || 'N/A' }}</span>
                        </div>
                        
                        <button 
                            class="btn-agregar-carrito" 
                            @click="agregarAlCarrito(producto)"
                        >
                            + Carrito
                        </button>
                    </div>
                </div>
                <div v-else>
                    <p>No hay productos disponibles en esta categoría.</p>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Estilos Generales */
.panel-central {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-image: url('/public/Fondo_Panel_user.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    padding-top: 100px; 
    box-sizing: border-box;
}
.Productos {
    background-color: #86c679;
    border-radius: 20px;
    width: 350px;
    padding: 5px 0;
}
h2 {
    text-align: center;
    margin: 0;
    color: black;
    font-size: 1.8rem;
}

/* Grid de contenedores */
.contenedores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
    gap: 40px; 
    margin-top: 40px;
    padding: 0 20px;
    width: 90%;
    max-width: 1200px;
}

/* Estilo de cada contenedor (Categoría) */
.contenedor {
    position: relative;
    background-color: white;
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between; 
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-height: 250px; 
    transition: transform 0.3s ease, background-color 0.3s ease;
}
.contenedor:hover {
    background-color: #6fae5a;
    transform: translateY(-5px); 
}

.nombre {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    color: white; 
    background-color: #55943d; 
    border-radius: 8px;
    width: 100%;
    padding: 10px 0;
    margin-bottom: 10px;
    position: static; 
}

.descripcion {
    text-align: center;
    font-weight: 400;
    font-size: 1rem;
    color: #333;
    flex-grow: 1; 
    padding: 10px 0;
}

.btn-ver-productos {
    background-color: #e4913c; 
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-top: 15px; 
}

.btn-ver-productos:hover {
    background-color: #c97f33;
}

/* ======================================================= */
/* 🖼️ ESTILOS DE LA MODAL (Ventana Emergente) */
/* ======================================================= */

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; 
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    max-height: 80vh; 
    overflow-y: auto; 
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #333;
}

.modal-content h3 {
    text-align: center;
    margin-top: 0;
    color: #55943d;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.productos-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.producto-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    background-color: #f7f7f7;
    border: 1px solid #eee;
}

.producto-detalle {
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
}

.nombre-producto {
    font-weight: 500;
    color: #333;
}

.precio-producto {
    font-weight: bold;
    color: #e4913c; 
    font-size: 1.1em;
}

/* 🟢 Estilos del botón Agregar Carrito */
.btn-agregar-carrito {
    background-color: #4CAF50; 
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-left: 15px; 
    white-space: nowrap; 
}

.btn-agregar-carrito:hover {
    background-color: #45a049;
}

/* 📱 Responsividad */
@media (max-width: 768px) {
    .contenedores-grid {
        grid-template-columns: 1fr; 
        width: 100%;
        padding: 0 15px;
    }
    .contenedor {
        min-height: 220px;
    }
    .panel-central {
        padding-top: 80px;
    }
    .producto-item {
        flex-direction: column;
        align-items: flex-start;
    }
    .btn-agregar-carrito {
        width: 100%;
        margin-top: 10px;
        margin-left: 0;
    }
    .producto-detalle {
        width: 100%;
    }
}
</style>