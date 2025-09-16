<template>
  <div class="main-container">
    <the-header></the-header>

    <div class="panel-central">
      <span class="arrow left">&#8592;</span>
      <div class="panel-content">
        <h2>Panel Central</h2>
        <p>Este es un panel blanco en el centro del grid.</p>
      </div>
      <span class="arrow right">&#8594;</span>
    </div>

    <div class="grid-container">
      <div class="product-card" v-for="n in 6" :key="n">
        <div class="seller-info">
          <div class="avatar-circle"><img src="../../../public/foto_user.png" alt=""></div>
          <div class="seller-text">
            <h6>Campesino 34</h6>
            <span>Sección: Verduras</span>
          </div>
        </div>
        <div class="product-image-container">
          <img class="product-img" src="../../../public/foto_producto.jpg" alt="Tomates">
        </div>
        <div class="product-details">
          <h5>Tomates</h5>
          <span class="description">Descripción del artículo</span>
        </div>
        <span class="contact">Contacto directo con el vendedor</span>
        <div class="buttons-container">
          <button class="btn more-info">Más información</button>
          <button class="btn add-to-cart">Agregar al carrito</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>

import theHeader from '../../components/theHeader.vue';
</script>

<style scoped>
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

.avatar-circle img{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #79C265;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
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

/* Media query para pantallas pequeñas (móviles) */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr; /* Una columna para móviles */
    width: 90%;
    gap: 1.5rem;
  }
  .product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
}

/* Media query para tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr); /* Dos columnas para tablets */
    gap: 1.5rem;
  }
  .product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
}
</style>