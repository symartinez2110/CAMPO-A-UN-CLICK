// componsables/useCartStore.js

import { ref, computed } from 'vue';
import useApi from '../componsables/useApi'; 
// Asegúrate de que useApi exporte 'get', 'post', 'put', 'del'
const { get, post, put, del } = useApi(); 

// 🚨 Ajusta esta URL si tu servidor Express no usa este puerto/IP 🚨
const BASE_URL = 'http://localhost:3000'; 

// Estado reactivo compartido (global)
const carritoItems = ref([]);
const totalCarrito = ref(0.0);
const isLoading = ref(false);

// =========================================================
// 🎯 LÓGICA CLAVE: OBTENER ID DEL COMPRADOR DESDE EL TOKEN
// =========================================================

function getCompradorIdFromLocalStorage() {
    try {
        const token = localStorage.getItem('token'); 
        if (!token) return null;

        // Decodificación simple del Payload del JWT
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payloadBase64 = parts[1];
        // Reemplazar Base64URL por Base64 estándar
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        
        const decoded = atob(base64);
        const jsonPayload = JSON.parse(decoded);
        
        // **IMPORTANTE**: Ajusta 'id_usuario' si tu JWT usa otro nombre (ej: 'id')
        return jsonPayload.id_usuario || null; 
    } catch (e) {
        console.error("Error al obtener ID del comprador (token inválido):", e);
        return null;
    }
}

// =========================================================
// 🎯 Funciones de Utilidad
// =========================================================

const getProductImageUrl = (imageName) => {
    if (!imageName || imageName === 'default.jpg') {
        return '/foto_producto_default.jpg'; 
    }
    return `${BASE_URL}/uploads/${imageName}`;
};

// Propiedades Computadas
const cantidadTotal = computed(() => {
    return carritoItems.value.reduce((sum, item) => sum + item.cantidad, 0);
});


// =========================================================
// 🎯 Acciones (CRUD y Checkout)
// =========================================================

// 1. Obtener/Recargar el carrito
async function fetchCart(compradorId) {
    if (!compradorId) {
        carritoItems.value = [];
        totalCarrito.value = 0.0;
        return;
    }
    isLoading.value = true;
    try {
        const data = await get(`/carrito/${compradorId}`);
        
        // Mapear los ítems para facilitar el acceso a las propiedades de Producto en la vista
        carritoItems.value = data.items.map(item => ({
            ...item,
            nombre: item.Producto ? item.Producto.nombre : 'Producto Desconocido',
            imagen: item.Producto ? item.Producto.imagen : 'default.jpg',
            // No eliminamos 'Producto' completamente para evitar que otras vistas fallen si lo usan
        }));
        totalCarrito.value = data.total;

    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        carritoItems.value = [];
        totalCarrito.value = 0.0;
    } finally {
        isLoading.value = false;
    }
}
const updateCart = fetchCart; // Alias para recargar


// 2. Eliminar un producto (Llama a DELETE /carrito/:id)
async function removeFromCart(idDetalleCarrito, compradorId) {
    isLoading.value = true;
    try {
        await del(`/carrito/${idDetalleCarrito}`);
        alert("Producto eliminado correctamente.");
        await updateCart(compradorId); 
    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        throw error;
    } finally {
        isLoading.value = false;
    }
}

// 3. Actualizar cantidad (Llama a PUT /carrito/:id)
async function updateQuantity(idDetalleCarrito, newQuantity, compradorId) {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) return;
    
    isLoading.value = true;
    try {
        await put(`/carrito/${idDetalleCarrito}`, { cantidad: quantity });
        await updateCart(compradorId); 
    } catch (error) {
        console.error("Error al actualizar cantidad:", error);
        throw error;
    } finally {
        isLoading.value = false;
    }
}

// 4. Checkout (Finalizar Compra - Llama a POST /ventas)
async function checkout(compradorId) {
    if (carritoItems.value.length === 0) {
        alert("El carrito está vacío. Agregue productos para realizar la compra.");
        return null;
    }

    isLoading.value = true;
    try {
        const itemsPayload = carritoItems.value.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad
        }));
        
        const payload = {
            id_comprador: compradorId,
            monto_total: totalCarrito.value, 
            items: itemsPayload 
        };
        
        const response = await post('/ventas', payload);
        
        // Vaciar el estado del carrito localmente después del éxito
        carritoItems.value = [];
        totalCarrito.value = 0.0;
        
        return response.venta.id_venta; 

    } catch (error) {
        console.error("Error en el checkout:", error);
        const errorMessage = error.response?.data?.error || "Error al procesar la venta. Verifique stock o datos.";
        alert(`❌ Error al finalizar la compra: ${errorMessage}`);
        await updateCart(compradorId); 
        return null;
    } finally {
        isLoading.value = false;
    }
}


// Exportación final del store
export default function useCartStore() {
    return {
        // Estado y Computed
        carritoItems,
        totalCarrito,
        isLoading,
        cantidadTotal,
        
        // Funciones (acciones)
        getCompradorId: getCompradorIdFromLocalStorage, // 💡 FUNCIÓN EXPORTADA
        fetchCart,
        updateCart,
        getProductImageUrl,
        removeFromCart,      
        updateQuantity,      
        checkout,            
    };
}