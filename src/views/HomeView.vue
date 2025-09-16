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
      <div class="panel" v-for="n in 6" :key="n">
        <h2>Campesino 34 {{ n }}</h2>
        <p>Contenido del panel {{ n }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Importa el nuevo componente
import theHeader from '../components/theHeader.vue'; // Asegúrate que la ruta sea correcta
</script>

<style scoped>
/* Estilo general del contenedor */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
  background-image: url('../../public/Fondo_Panel_User.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* LOS ESTILOS DEL HEADER YA NO VAN AQUÍ, LOS HEMOS MOVIDO */

.panel-central {
  background-color: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.15);
  text-align: center;
  grid-column: span 3;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 95%;
  margin-bottom: 1.5rem;
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
  gap: 20px;
  width: 70%;
  max-width: 1000px;
  padding: 0 20px;
}

.panel {
  background-color: #AEF379;
  padding: 20px 4px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>