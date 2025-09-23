
<script setup>
import theHeader from '../../components/theHeader.vue';
</script>

<template>
     
     <div>
    <theHeader />

    <!-- Panel Central -->
    <div class="panel-central">
      <button class="edit-button">
          <span class="edit-icon">✏️</span>
          <span>EDITAR</span>
        </button>

      <div class="contenedores-grid">
        <div class="contenedor">Dato 1</div>
        <div class="contenedor">Dato 2</div>
        <div class="contenedor">Dato 3</div>
        <div class="contenedor">Dato 4</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-central {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  background-image: url('/public/Fondo_Panel_user.jpg');
  position: relative;
  width: fit-content;
  margin: 40px auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

/* Botón editar */
.edit-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* Grid de contenedores */
.contenedores-grid {
  display: grid;
  grid-template-columns: repeat(2, 150px);
  grid-template-rows: repeat(2, 100px);
  gap: 15px;
  margin-top: 40px;
}

/* Estilo de cada contenedor */
.contenedor {
  background-color:#86c679;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: bold;
}
</style>
