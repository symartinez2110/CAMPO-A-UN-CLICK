<template>
  <div class="carrito-sidebar">
    <div class="sidebar-header">
      <h3>Mi Carrito 🛒</h3>
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>

    <hr>
    
    <div class="sidebar-content">
      <p>Aún no hay productos en el carrito. Agrega algo de la sección de Productos.</p>
    </div>
    
    <div class="sidebar-footer">
      <div class="total-resumen">
        <span>Total estimado:</span>
        <span class="total-monto">$0.00</span>
      </div>
      
      <router-link :to="{ name: 'carritoUser' }" @click="$emit('close')">
        <button class="btn-ver-carrito">
          Ver Carrito Completo
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';
// Define el evento 'close' para que el padre pueda cerrar el componente
const emit = defineEmits(['close']); 
</script>

<style scoped>
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
  padding: 20px;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #ddd;
  text-align: center;
}

.total-resumen {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #1e7007;
}

.btn-ver-carrito {
  width: 100%;
  padding: 12px;
  background-color: #64b129;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-ver-carrito:hover {
  background-color: #4a8d20;
}
</style>