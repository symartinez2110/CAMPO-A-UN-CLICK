<template>
  <div class="carrito-sidebar">
    <div class="sidebar-header">
      <h3>Mi Carrito 🛒 ({{ carritoItems.length }})</h3> 
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>

    <hr>
    
    <div class="sidebar-content">
      <div v-if="isLoading" class="loading-message">Cargando carrito...</div>
      <div v-else-if="carritoItems.length === 0" class="no-products-message">
        Aún no hay productos en el carrito.
      </div>
      <div v-else class="items-list">
        <div class="item-card" v-for="item in carritoItems" :key="item.id_detalle_carrito">
            <img 
                :src="getProductImageUrl(item.imagen)" 
                :alt="item.nombre" 
                class="item-img"
            >
            <div class="item-details">
                <span class="item-name">{{ item.nombre }}</span> 
                
                <input 
                    type="number" 
                    :value="item.cantidad" 
                    min="1" 
                    class="qty-input"
                    @change="handleQuantityChange(item.id_detalle_carrito, $event.target.value)"
                    :disabled="isLoading"
                >
            </div>
            <div class="item-actions">
                <span class="item-price">${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</span> 
                
                <button 
                    @click="handleRemove(item.id_detalle_carrito)" 
                    class="btn-remove" 
                    :disabled="isLoading"
                >
                    X
                </button>
            </div>
        </div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="total-resumen">
        <span>Total a Pagar:</span>
        <span class="total-monto">${{ totalCarrito.toFixed(2) }}</span>
      </div>
      
      <button 
        @click="handleCheckout" 
        :disabled="carritoItems.length === 0 || isLoading" 
        class="btn-checkout"
      >
        {{ isLoading ? 'Procesando...' : 'Finalizar Venta' }}
      </button>
      
      <router-link :to="{ name: 'carritoUser' }" @click="$emit('close')">
            <button class="btn-ver-carrito" :disabled="isLoading">
                Ver Carrito Completo
            </button>
        </router-link>

    </div>
  </div>
</template>

<script setup>
import { defineEmits, onMounted, ref } from 'vue';
import useCartStore from '../store/useCartStore'; 

const emit = defineEmits(['close']); 

const { 
    carritoItems, 
    totalCarrito, 
    isLoading, 
    getProductImageUrl,
    removeFromCart, 
    updateQuantity, 
    checkout,
    updateCart,
    getCompradorId // 💡 Importar la función corregida
} = useCartStore();

const currentCompradorId = ref(null); // Usamos ref para almacenar el ID aquí

// Cargar el carrito al montar el componente
onMounted(() => {
    // 💡 Obtener el ID del comprador usando la función centralizada
    currentCompradorId.value = getCompradorId();
    
    if (currentCompradorId.value) {
        updateCart(currentCompradorId.value);
    }
});


// 🎯 MANEJADOR DE ELIMINAR
async function handleRemove(idDetalleCarrito) {
    const compradorId = currentCompradorId.value;
    if (!compradorId) return alert("Error: ID de comprador no disponible. Inicie sesión.");
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            await removeFromCart(idDetalleCarrito, compradorId);
        } catch (error) {
            console.error("Fallo al eliminar:", error); 
        }
    }
}

// 🎯 MANEJADOR DE CAMBIO DE CANTIDAD
async function handleQuantityChange(idDetalleCarrito, value) {
    const compradorId = currentCompradorId.value;
    if (!compradorId) return alert("Error: ID de comprador no disponible. Inicie sesión.");
    
    const newQuantity = parseInt(value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        await updateCart(compradorId);
        return;
    }
    
    try {
        await updateQuantity(idDetalleCarrito, newQuantity, compradorId);
    } catch (error) {
        // Manejo de errores de stock del backend
        const errorMessage = error.response?.data?.error || 'Error al actualizar cantidad.';
        alert(errorMessage);
        // Forzar recarga para mostrar la cantidad correcta que quedó en el carrito
        await updateCart(compradorId); 
    }
}

// 🎯 MANEJADOR DE CHECKOUT
async function handleCheckout() {
    const compradorId = currentCompradorId.value;
    if (!compradorId) {
        alert("Debes iniciar sesión para finalizar la compra.");
        return;
    }
    
    if (confirm(`¿Confirmas la compra por un total de $${totalCarrito.value.toFixed(2)}?`)) {
        const idVenta = await checkout(compradorId); 
        
        if (idVenta) {
            alert(`🎉 ¡Compra finalizada con éxito! Número de Venta: ${idVenta}.`);
            emit('close'); // Cierra la sidebar
        }
    }
}
</script>

<style scoped>
/* AÑADE O REEMPLAZA ESTOS ESTILOS */
.carrito-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 350px; 
  background-color: #f7fff2; 
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1000; 
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e0f8ce; 
}

.sidebar-header h3 {
  margin: 0;
  color: #1e7007;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.sidebar-content {
  flex-grow: 1;
  padding: 10px 20px;
  overflow-y: auto;
}

.no-products-message, .loading-message {
    text-align: center;
    color: #888;
    padding: 20px;
}

.items-list {
    display: flex;
    flex-direction: column;
}

.item-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.item-img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 10px;
    flex-shrink: 0;
}

.item-details {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
}

.item-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px; 
}

.qty-input {
    width: 50px;
    padding: 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 5px;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-price {
    font-weight: bold;
    color: #1e7007;
    white-space: nowrap;
    font-size: 1rem;
    min-width: 60px;
    text-align: right;
    flex-shrink: 0;
}

.btn-remove {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 12px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    flex-shrink: 0;
}

.btn-remove:hover:not(:disabled) {
    background: #c0392b;
}

.sidebar-footer {
  padding: 20px;
  border-top: 2px solid #ddd;
  background-color: white; 
}

.total-resumen {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 700;
}

.total-monto {
  color: #1e7007;
}

.btn-checkout {
  width: 100%;
  padding: 12px;
  background-color: #1e7007;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px; 
}

.btn-checkout:hover:not(:disabled) {
  background-color: #175205;
}

.btn-checkout:disabled {
    background-color: #a4cfa4;
    cursor: not-allowed;
}

.btn-ver-carrito {
    width: 100%;
    padding: 10px;
    background-color: #3498db; 
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-ver-carrito:hover:not(:disabled) {
    background-color: #2980b9; 
}
.btn-ver-carrito:disabled {
    background-color: #a4cfa4;
    cursor: not-allowed;
}
</style>