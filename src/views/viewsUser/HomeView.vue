<script setup>
import { ref, onMounted } from 'vue';
import theHeader from '../../components/theHeader.vue';
import useApi from "../../componsables/useApi"; 

const { get, post } = useApi(); 
const productos = ref([]); 
const loading = ref(false); 

const showContactModal = ref(false);
const selectedCampesino = ref(null);
// 🔑 CLAVE: Almacena el ID del usuario logueado (Comprador)
const currentCompradorId = ref(null); 


// ==================== LÓGICA DE DATOS Y ESTADO ====================

// 💡 Nuevo: Obtiene el ID del usuario logueado para usarlo en el carrito
async function fetchCurrentUserId() {
  try {
    // Endpoint para obtener datos del usuario autenticado (asumiendo que usa el token JWT)
    const data = await get('/auth/me'); 
    // Usamos 'id_usuario' o 'id' dependiendo de tu backend
    currentCompradorId.value = data.id_usuario || data.id || null; 
  } catch (error) {
    // Si falla, el usuario no está logueado o el token expiró. El ID queda en null.
    console.warn("Usuario no autenticado para acciones de carrito.", error);
    currentCompradorId.value = null;
  }
}

async function cargarProductos() {
  loading.value = true;
  try {
    // Endpoint principal para mostrar productos
    const data = await get("/productos"); 
    productos.value = data;
  } catch (error) {
    console.error("Error cargando productos:", error);
    productos.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // 1. Obtiene el ID del comprador
  fetchCurrentUserId(); 
  // 2. Carga los productos
  cargarProductos();
});


// ==================== FUNCIONALIDADES DEL USUARIO ====================

function getProductImageUrl(imagenFilename) {
    // 🛑 CORRECCIÓN CLAVE: La ruta apunta a tu Express (localhost:3000) 
    // y al directorio estático '/uploads' configurado en tu app.js.
  	if (imagenFilename) {
    	return `http://localhost:3000/uploads/${imagenFilename}`;
  	}
  	return '/foto_producto_default.jpg'; // Imagen por defecto en caso de que no haya nombre
}

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function openContactModal(campesino) {
  selectedCampesino.value = campesino;
  showContactModal.value = true;
}

// 🔴 AGILIZADO Y CORREGIDO: Agrega el producto al carrito usando el ID real
async function addToCart(product) {
  if (!currentCompradorId.value) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    return;
  }

  const payload = {
    id_producto: product.id_producto,
    // Usamos el ID del comprador obtenido
    id_comprador: currentCompradorId.value, 
    cantidad: 1, 
    precio: product.precio 
  };

  try {
    await post("/carrito", payload); 
    alert(`✅ ¡${product.nombre} agregado al carrito con éxito!`);
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("❌ Error al agregar producto al carrito.");
  }
}
</script>

<template>
  <div class="main-container">
    <the-header></the-header>

    <div class="panel-central">
      <span class="arrow left">&#8592;</span>
      <div class="panel-content">
        <h2>Productos Disponibles</h2>
        <p>Explora la oferta de nuestros campesinos. ({{ productos.length }} productos cargados)</p>
      </div>
      <span class="arrow right">&#8594;</span>
    </div>

    <div class="grid-container">
      <div class="product-card" v-for="product in productos" :key="product.id_producto">
        
        <div class="seller-info">
          <div class="avatar-circle">
            <span>{{ getInitial(product.campesino?.Nombre) }}</span>
          </div>
          <div class="seller-text">
            <h6>{{ product.campesino?.Nombre || 'Vendedor Desconocido' }}</h6> 
            <span>Sección: {{ product.categoria?.nombre || 'General' }}</span> 
          </div>
        </div>
        
        <div class="product-image-container">
          <img class="product-img" 
                :src="getProductImageUrl(product.imagen)" 
                :alt="product.nombre">
        </div>
        
        <div class="product-details">
          <h5>{{ product.nombre }} - ${{ product.precio }}</h5>
          <span class="description">
            {{ product.descripcion?.substring(0, 50) }}... | 
            **Disponible:** {{ product.cantidad_disponible }}
          </span>
        </div>
        
        <span class="contact">Contacto directo con el vendedor</span>
        
        <div class="buttons-container">
          <button class="btn more-info" @click="openContactModal(product.campesino)">Contacto Vendedor</button>
          
          <button class="btn add-to-cart" @click="addToCart(product)" 
                      :disabled="!currentCompradorId">
            {{ currentCompradorId ? 'Agregar al carrito' : 'Inicia sesión' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!productos.length && !loading" class="no-products-message">
        No hay productos disponibles en este momento.
    </div>
    
    <div v-if="loading" class="loading-message">
        Cargando productos...
    </div>

    <div v-if="showContactModal" class="modal-overlay" @click.self="showContactModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showContactModal = false">&times;</button>
        <div v-if="selectedCampesino" class="contact-card">
          <h4>Datos de Contacto del Vendedor</h4>
          <p><strong>Nombre:</strong> {{ selectedCampesino.Nombre }}</p>
          <p><strong>Email:</strong> {{ selectedCampesino.email }}</p>
          <p><strong>Teléfono:</strong> {{ selectedCampesino.telefono || 'No disponible' }}</p>
          <p><strong>Rol:</strong> {{ selectedCampesino.rol }}</p>
        </div>
        <div v-else>
          <p>Información del vendedor no disponible.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  max-width: 400px;
  width: 90%;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.contact-card h4 {
  color: #64b129;
  border-bottom: 2px solid #cceeb3;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #79C265; 
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem; 
}

.avatar-circle img {
  display: none; 
}

.no-products-message, .loading-message {
  padding: 20px;
  background-color: #ffe0e0;
  color: #cc0000;
  border-radius: 8px;
  margin-top: 20px;
  width: 90%;
  max-width: 900px;
  text-align: center;
  font-weight: bold;
}
.loading-message {
  background-color: #e0f7fa;
  color: #00838f;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
  background-image: url('../../../public/Fondo_Panel_User.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding: 1rem 0;
}

.panel-central {
  background-color: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.15);
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 95%;
  max-width: 900px;
  margin-bottom: 2.5rem;
  height: 5rem;
}

.panel-content h2 {
  font-size: 16px;
  margin: 4px 0;
}

.panel-content p {
  font-size: 13px;
  margin: 2px 0;
}

.panel-content {
  z-index: 1;
}

.arrow {
  font-size: 24px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  user-select: none;
  z-index: 2;
}

.arrow.left {
  left: 10px;
}

.arrow.right {
  right: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 90%;
  max-width: 1200px;
  padding: 0 1rem;
}

.product-card {
  background-color: #B5E491; 
  padding: 1.5rem 1rem 1rem; 
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.seller-text {
  display: flex;
  flex-direction: column;
}

.seller-text h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.seller-text span {
  font-size: 0.85rem;
  color: #666;
}

.product-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-details h5 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
}

.description {
  font-size: 0.9rem;
  color: #777;
}

.contact {
  font-size: 0.8rem;
  color: #888;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 50%;
}

.more-info {
  background-color: transparent;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.add-to-cart {
  background-color: #6F499E;
  color: white;
  border: 2px solid #6F499E;
}

.btn:hover {
  opacity: 0.8;
}

/* --- Responsividad --- */

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    width: 90%;
    gap: 1.5rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr); 
    gap: 1.5rem;
  }
}
</style>