<template>
    <div class="carrito-page">
        <h2>🛒 Mi Carrito de Compras</h2>
        
        <div v-if="isLoading" class="loading-message">Cargando carrito...</div>
        <div v-else-if="carritoItems.length === 0" class="empty-message">
            Aún no tienes productos en tu carrito. ¡Explora nuestros productos frescos!
        </div>
        <div v-else class="items-container">
            <div class="header-row">
                <span>Producto</span>
                <span class="header-control">Cantidad</span>
                <span class="header-control">Precio Total</span>
                <span class="header-control"></span>
            </div>
            
            <div class="item-row" v-for="item in carritoItems" :key="item.id_detalle_carrito">
                <div class="item-info">
                    <img :src="getProductImageUrl(item.imagen)" :alt="item.nombre" class="product-thumb">
                    <div class="details">
                        <span class="name">{{ item.nombre }}</span>
                        <span class="unit-price">${{ item.precio_unitario.toFixed(2) }} / unid.</span>
                    </div>
                </div>
                
                <div class="item-controls">
                    <input type="number" :value="item.cantidad" min="1" class="qty-input">
                    <span class="total-price">${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</span>
                    <button class="btn-remove">X</button>
                </div>
            </div>
            
            <div class="carrito-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${{ totalCarrito.toFixed(2) }}</span>
                </div>
                <div class="summary-row final-total">
                    <h3>Total:</h3>
                    <h3>${{ totalCarrito.toFixed(2) }}</h3>
                </div>
                <button class="btn-checkout">Finalizar Compra</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import useCartStore from '../store/useCartStore'; // 👈 IMPORTAR EL STORE

// 💡 OBTENER ESTADO DEL STORE
const { carritoItems, totalCarrito, isLoading, getProductImageUrl } = useCartStore();

// NOTA: No es necesario llamar a fetchCart aquí si HomeView ya lo hace al cargar la aplicación.
</script>

<style scoped>
.carrito-page {
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #64b129;
    border-bottom: 2px solid #e0f8ce;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.empty-message, .loading-message {
    text-align: center;
    padding: 50px;
    font-size: 1.2em;
    color: #888;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    font-weight: bold;
    border-bottom: 2px solid #e0f8ce;
    color: #333;
}

.header-row span:first-child {
    flex-basis: 50%; /* Espacio para info de producto */
}

.header-control {
    flex-basis: 15%;
    text-align: center;
}

.item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding: 15px 0;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-basis: 50%;
}

.product-thumb {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 8px;
}

.details {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: bold;
    color: #333;
    font-size: 1.1em;
}

.unit-price {
    font-size: 0.9em;
    color: #666;
}

.item-controls {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-basis: 50%;
    justify-content: flex-end;
}

.qty-input {
    width: 60px;
    padding: 8px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-basis: 30%;
}

.total-price {
    font-weight: bold;
    font-size: 1.1em;
    color: #1e7007;
    min-width: 80px;
    text-align: right;
    flex-basis: 30%;
}

.btn-remove {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: bold;
    flex-shrink: 0;
}

/* Resumen */
.carrito-summary {
    margin-top: 30px;
    padding: 20px;
    background-color: #f7fff2;
    border-radius: 8px;
    border: 1px solid #e0f8ce;
    width: 50%; /* Mantiene el resumen a la derecha */
    margin-left: auto;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 1.1em;
}

.final-total h3 {
    margin: 0;
    color: #1e7007;
    font-size: 1.4em;
}

.btn-checkout {
    width: 100%;
    padding: 15px;
    margin-top: 20px;
    background-color: #6F499E;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2em;
    font-weight: bold;
    transition: background-color 0.3s;
}

.btn-checkout:hover {
    background-color: #5b3d7d;
}
</style>