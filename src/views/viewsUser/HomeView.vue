<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import theHeader from '../../components/theHeader.vue';
  import useApi from "../../componsables/useApi";
  import useCartStore from "../../store/useCartStore";

  const { get, post } = useApi();
  const { fetchCart, updateCart } = useCartStore();

  // --- ESTADOS PRINCIPALES ---
  const todosLosProductos = ref([]); // Lista completa de productos (sin filtrar)
  const productosFiltrados = ref([]); // Productos actualmente visibles en el grid
  const loading = ref(false);

  // --- ESTADOS CARRUSEL Y FILTRO ---
  const categorias = ref([]);         // Lista completa de categorías
  const currentCategoryIndex = ref(0); // Índice de la categoría actual en el carrusel
  const filtroActivoId = ref(null);   // ID de la categoría seleccionada para filtrar (null = todos)
  let rotationInterval = null;        // Variable para controlar el timer

  // --- ESTADOS MODAL/CONTACTO/CARRITO ---
  const showContactModal = ref(false);
  const selectedCampesino = ref(null);
  const currentCompradorId = ref(null);


  // ==================== FUNCIONES COMPUTADAS ====================

  // Obtiene la categoría actualmente visible en el carrusel
  const currentCategory = computed(() => {
    if (categorias.value.length === 0) return null;
    return categorias.value[currentCategoryIndex.value];
  });


  // ==================== LÓGICA DE DATOS Y ESTADO ====================

  async function fetchCurrentUserId() {
    try {
      const data = await get('/auth/me');
      currentCompradorId.value = data.id_usuario || data.id || null;

      if (currentCompradorId.value) {
        await fetchCart(currentCompradorId.value);
      }

    } catch (error) {
      console.warn("Usuario no autenticado para acciones de carrito.", error);
      currentCompradorId.value = null;
    }
  }

  // FUNCIÓN DE FILTRADO UNIFICADA
  function actualizarProductosVisibles() {
    if (filtroActivoId.value === null) {
      // Mostrar todos los productos
      productosFiltrados.value = todosLosProductos.value;
    } else {
      // Filtrar por la categoría seleccionada
      productosFiltrados.value = todosLosProductos.value.filter(p =>
        p.id_categoria === filtroActivoId.value || p.categoria?.id_categoria === filtroActivoId.value
      );
    }
  }


  async function cargarProductos() {
    loading.value = true;
    try {
      const data = await get("/productos");
      todosLosProductos.value = data; // Almacena la lista completa
      actualizarProductosVisibles(); // Inicialmente muestra todos
    } catch (error) {
      console.error("Error cargando productos:", error);
      todosLosProductos.value = [];
      productosFiltrados.value = [];
    } finally {
      loading.value = false;
    }
  }


  // FUNCIÓN QUE ACTIVA EL FILTRO AL HACER CLIC EN EL CARRUSEL
  function activarFiltro(categoryId) {
    // Si se hace clic en la categoría que ya está activa, la desactiva.
    if (filtroActivoId.value === categoryId) {
      filtroActivoId.value = null;
    } else {
      filtroActivoId.value = categoryId;
    }
    actualizarProductosVisibles();
  }
  
  // 🟢 NUEVA FUNCIÓN: Restablece el filtro a la vista normal
  function resetFiltro() {
    filtroActivoId.value = null;
    actualizarProductosVisibles();
    // Reinicia la rotación por si el usuario la detuvo con el mouse
    iniciarRotacion();
  }


  // FUNCIÓN: Carga la lista de categorías
  async function cargarCategorias() {
    try {
      const data = await get("/categorias");
      categorias.value = data;
      if (categorias.value.length > 0) {
        iniciarRotacion();
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  }

  // ==================== LÓGICA DEL CARRUSEL ====================

  // LÓGICA DEL CARRUSEL: Inicia la rotación automática
  function iniciarRotacion() {
    detenerRotacion();
    if (categorias.value.length <= 1) return;

    // Rotar cada 5 segundos (5000 milisegundos)
    rotationInterval = setInterval(() => {
      nextCategory();
    }, 5000);
  }

  // LÓGICA DEL CARRUSEL: Muestra la siguiente categoría
  function nextCategory() {
    if (categorias.value.length === 0) return;
    currentCategoryIndex.value = (currentCategoryIndex.value + 1) % categorias.value.length;
  }

  // LÓGICA DEL CARRUSEL: Muestra la categoría anterior
  function prevCategory() {
    if (categorias.value.length === 0) return;
    currentCategoryIndex.value = (currentCategoryIndex.value - 1 + categorias.value.length) % categorias.value.length;
  }

  // LÓGICA DEL CARRUSEL: Detiene la rotación
  function detenerRotacion() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }


  // ==================== FUNCIONALIDADES AUXILIARES ====================

  function getProductImageUrl(imagenFilename) {
    if (imagenFilename) {
      return `http://localhost:3000/uploads/${imagenFilename}`;
    }
    return '/foto_producto_default.jpg';
  }

  function getInitial(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  function getPhoneLink(phone) {
    const cleanPhone = phone ? String(phone).replace(/[^0-9+]/g, '') : '';
    return `tel:${cleanPhone}`;
  }


  function openContactModal(campesino) {
    selectedCampesino.value = {
      Nombre: campesino?.Nombre || 'N/A',
      email: campesino?.email || 'N/A',
      telefono: campesino?.telefono || 'No disponible',
    };
    showContactModal.value = true;
  }

  // FUNCIÓN CARRITO: Agrega el producto al carrito y actualiza el estado global
  async function addToCart(product) {
    if (!currentCompradorId.value) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    const payload = {
      id_producto: product.id_producto,
      id_comprador: currentCompradorId.value,
      cantidad: 1,
      precio: product.precio
    };

    try {
      await post("/carrito", payload);

      // CLAVE: Vuelve a cargar los datos del carrito para actualizar la sidebar/vista
      await updateCart(currentCompradorId.value);

      alert(`✅ ¡${product.nombre} agregado al carrito con éxito!`);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      const errorMessage = error.response?.data?.error || "Error al agregar producto al carrito.";
      alert(`❌ ${errorMessage}`);
    }
  }


  // ==================== HOOKS DEL CICLO DE VIDA ====================

  onMounted(() => {
    fetchCurrentUserId();
    cargarProductos();
    cargarCategorias();
  });

  // Detiene el timer cuando el componente se destruye/abandona
  onUnmounted(() => {
    detenerRotacion();
  });
</script>

<template>
  <div class="main-container">
    <the-header></the-header>

    <div
      class="panel-central"
      @mouseenter="detenerRotacion"
      @mouseleave="iniciarRotacion"
      :class="{ 'filter-active': filtroActivoId !== null }"
    >

      <span class="arrow left" @click="prevCategory">&#8592;</span>

      <div class="panel-content" @click="activarFiltro(currentCategory?.id_categoria)" role="button" aria-label="Filtrar productos por esta categoría">
        <template v-if="categorias.length > 0 && currentCategory">
          <h2 :class="{ 'filtered-text': filtroActivoId === currentCategory.id_categoria }">
            {{ filtroActivoId === currentCategory.id_categoria ? 'FILTRO ACTIVO: ' : 'Destacado: ' }}
            {{ currentCategory.nombre }}
          </h2>
          <p>{{ currentCategory.descripcion }}</p>
          <span class="click-info">
            {{ filtroActivoId === currentCategory.id_categoria ? 'Click para ver todos los productos' : 'Click para filtrar' }}
          </span>
        </template>
        <template v-else>
          <h2>Productos Disponibles</h2>
          <p>Explora la oferta de nuestros campesinos. ({{ productosFiltrados.length }} productos)</p>
        </template>
      </div>

      <span class="arrow right" @click="nextCategory">&#8594;</span>
      
      <button v-if="filtroActivoId !== null" 
              @click.stop="resetFiltro" 
              class="btn-reset-filter" 
              aria-label="Quitar filtro de categoría">&times;</button>
    </div>

    <div v-if="filtroActivoId !== null" class="filter-message" @click="resetFiltro">
      Filtrando por **{{ currentCategory?.nombre }}**. Click para ver todos los productos.
    </div>

    <div v-if="loading" class="loading-message">
      Cargando productos...
    </div>

    <div v-else-if="!productosFiltrados.length" class="no-products-message">
      No hay productos disponibles {{ filtroActivoId !== null ? 'en esta categoría.' : 'en este momento.' }}
    </div>

    <div v-else class="grid-container">
      <div class="product-card" v-for="product in productosFiltrados" :key="product.id_producto">

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

    <div v-if="showContactModal" class="modal-overlay" @click.self="showContactModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showContactModal = false">&times;</button>
        <div v-if="selectedCampesino" class="contact-card">
          <h4>Datos de Contacto del Vendedor</h4>
          <p><strong>Nombre:</strong> {{ selectedCampesino.Nombre }}</p>
          <p><strong>Email:</strong> {{ selectedCampesino.email }}</p>
          <p><strong>Teléfono:</strong> {{ selectedCampesino.telefono }}</p>
          <a :href="getPhoneLink(selectedCampesino.telefono)"
            class="btn-llamar"
            :class="{ 'disabled': selectedCampesino.telefono === 'No disponible' }">
            📞 Llamar Ahora
          </a>
        </div>
        <div v-else>
          <p>Información del vendedor no disponible.</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  /* ======================================================= */
  /* ESTILOS GENERALES */
  /* ======================================================= */
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: sans-serif;
    background-image: url('/public/Fondo_Panel_User.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    padding: 1rem 0;
    /* 🛠️ AJUSTE CLAVE 1: Asegurar que el contenido no exceda el viewport */
    width: 100%; 
    overflow-x: hidden; /* Evita el scroll horizontal forzado */
    box-sizing: border-box; 
  }

  /* ======================================================= */
  /* ESTILOS DEL CARRUSEL/PANEL CENTRAL (MODIFICADO) */
  /* ======================================================= */
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
    height: 6rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  /* ... (Resto de estilos del panel central sin cambios) ... */

  .panel-central:hover {
    background-color: #f0fff0;
  }

  .panel-central.filter-active {
    background-color: #d8f5d0;
    border: 2px solid #55943d;
  }

  .panel-content h2 {
    font-size: 1.5rem;
    margin: 4px 0;
    color: #55943d;
  }

  .panel-content p {
    font-size: 1rem;
    margin: 2px 0;
    color: #333;
  }

  .filtered-text {
    font-weight: bold;
    color: #e4913c !important;
  }

  .click-info {
    font-size: 0.8rem;
    color: #007bff;
    display: block;
    margin-top: 5px;
    font-style: italic;
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
    padding: 10px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }

  .arrow.left {
    left: 10px;
  }

  .arrow.right {
    right: 10px;
  }
  
  /* Botón de Quitar Filtro */
  .btn-reset-filter {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    line-height: 1; 
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 3;
    transition: background-color 0.2s;
  }
  
  .btn-reset-filter:hover {
    background: #d32f2f;
  }


  .filter-message {
    padding: 10px 20px;
    background-color: #fef7e0;
    color: #9c6c00;
    border: 1px solid #ffcc00;
    border-radius: 5px;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    width: 95%;
    max-width: 900px;
    text-align: center;
  }

  .filter-message:hover {
    background-color: #fff3cd;
  }

  /* ======================================================= */
  /* ESTILOS DEL GRID Y TARJETAS DE PRODUCTO */
  /* ======================================================= */
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

  /* --- Información del Vendedor --- */
  .seller-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  /* --- Detalles del Producto --- */
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

  .add-to-cart:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }

  /* --- Mensajes de estado --- */
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

  /* ======================================================= */
  /* ESTILOS DEL MODAL */
  /* ======================================================= */
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

  .btn-llamar {
    display: block;
    width: 100%;
    padding: 12px 20px;
    margin-top: 20px;
    background-color: #2196F3;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: background-color 0.3s;
    text-align: center;
    box-sizing: border-box;
  }

  .btn-llamar:hover:not(.disabled) {
    background-color: #0b7dda;
  }

  .btn-llamar.disabled {
    background-color: #ccc;
    cursor: not-allowed;
    pointer-events: none;
  }


  /* ======================================================= */
  /* MEDIA QUERIES (Responsividad) */
  /* ======================================================= */

  @media (max-width: 768px) {
    /* Pantallas Pequeñas (Móviles) */
    
    /* 🛠️ AJUSTE CLAVE 2: Adaptar el contenedor de grid */
    .grid-container {
      grid-template-columns: 1fr; 
      width: 100%; /* Ocupa el 100% del espacio disponible */
      padding: 0 10px; /* Añadir un padding pequeño para no tocar los bordes */
      gap: 1rem; /* Reducir el espacio entre tarjetas */
    }
    
    .panel-content h2 {
      font-size: 1.2rem;
    }
    
    .panel-content p {
      font-size: 0.9rem;
    }
    
    /* 🛠️ COMPRESIÓN DE TARJETA */
    .product-card {
        padding: 1rem 0.75rem 0.75rem; 
    }
    .product-image-container {
        height: 150px; 
    }
    .avatar-circle {
        width: 40px; 
        height: 40px;
        font-size: 1.2rem;
    }
    .seller-text h6 {
        font-size: 0.9rem; 
    }
    .product-details h5 {
        font-size: 1.1rem; 
    }

    /* 🛠️ APILAR BOTONES EN MÓVILES */
    .buttons-container {
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      width: 100%; 
      font-size: 1rem;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    /* Pantallas Medianas (Tablets) */
    .grid-container {
      grid-template-columns: repeat(2, 1fr); 
      gap: 1.5rem;
    }
  }
</style>