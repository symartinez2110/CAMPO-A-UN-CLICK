<template>
  <div class="main-container">
    <!-- Panel superior con título -->
    <header class="header">
        <h1>CAMPESINO</h1>
        <div class="menu-icon">&#9776;</div>
      
    </header>
<!-- Panel central blanco -->
      <div class="panel-central">
  <span class="arrow left">&#8592;</span> <!-- Flecha izquierda -->
  
  <div class="panel-content">
    <h2>Panel Central</h2>
    <p>Este es un panel blanco en el centro del grid.</p>
  </div>

  <span class="arrow right">&#8594;</span> <!-- Flecha derecha -->
</div>

    <!-- Contenedor de los 6 paneles pequeños -->
  <div class="grid-container">
  <div class="panel" v-for="n in 6" :key="n">
    <h2>Campesino 34 {{ n }}</h2>
    <p>Contenido del panel {{ n }}</p>
  </div>
</div>

  </div>
</template>

<script setup>
// No es necesario script por ahora
</script>

<style scoped>
/* Estilo general del contenedor */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-family: sans-serif;

  



    /* Fondo de imagen */
  background-image: url('../../public/Fondo_Panel_User.jpg'); /* ruta de mi imagen */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /*En pantalla completa */
  min-height: 100vh;
  width: 100%;
}
.main-container h1 {
  margin-left: 90px;
}

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
  width: 100%;
  margin-bottom: 20px;
  max-width: 1000px;

}
/* Estilos para el contenido del panel central */
.panel-content h2 {
  font-size: 16px; /*  más pequeño */
  margin: 4px 0;
}

.panel-content p {
  font-size: 13px; /* más pequeño */
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

.header {
  border-top-width : 1px;  
  border-top-style: 5px;
  width: 100%;
  background-color: #AEF379;
  color: black;
  padding: 10px 20px;
  display: flex;                    
  justify-content: space-between;  
  align-items: center;            
  border-radius: 8px;
  margin-bottom: 10px;
}

.h1 {
  font-size: 24px;
  margin-left: 300  px;
  font-weight: bold;
}

.menu-icon {
  font-size: 28px;
  cursor: pointer;
  user-select: none;
  color: black;
}


/* Grid de paneles */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 70%;
  max-width: 1000px;
  padding:0 20px;
   
}

/* Cada panel pequeño */
.panel {
  background-color: #AEF379;
  padding: 20px 4px;            /* Menor padding horizontal, más vertical */
  border-radius: 8px;            /* Corrección: antes estaba vacío */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 280px;                 /* Altura fija para alargar el panel */
  display: flex;                 /* Para centrar el contenido verticalmente */
  flex-direction: column;
  justify-content: center;
}


</style>