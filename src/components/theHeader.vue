<template>
  <div class="header">
    <img class="icon" src="../../public/avatar.jpg" alt="avatar del campesino">
    <h1>Campesino 0.1</h1>
  <!-- Menu desplegable-->
   <div class="menu-container" ref="menuContainerRef">
    <div class="menu-icon" @click="toggleMenu">&#9776;</div>


    <div v-if="isMenuOpen" class="dropdown-menu" >
        <ul>
            <li>EDITAR PERFIL</li>
            <li>PRODUCTOS</li>
        </ul>
    </div>
   </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isMenuOpen = ref(false);


const menuContainerRef = ref(null);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}


function closeMenu() {
  isMenuOpen.value = false;
}


const handleClickOutside = (event) => {
  
  if (menuContainerRef.value && !menuContainerRef.value.contains(event.target)) {
    closeMenu();
  }
};


onMounted(() => {
  
  document.addEventListener('click', handleClickOutside);
});


onUnmounted(() => {

  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  width: 100%;
  margin-top: -0.6rem;
  height: 6rem;
  background-color: #AEF379;
  color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
   box-shadow: 0 3px 7px rgba(0, 0, 0, 0.15);

}

.header h1 {
  font-size: 20px;
  font-weight: bold;
  margin-right: auto;
  padding-left: 1rem;
}

.icon{
    height: 70px;
    width: 70px;
    border-radius: 1rem;
    margin-top: 0.5rem;
    margin-left: 0.8rem;
}
.menu-icon {
 margin-right: 2.5rem;
 font-size: x-large;
 user-select: none;
}

.menu-icon:hover{
    cursor: pointer;
    color: #f9f9f9;
}

.menu-container{
    position: relative;
}

/* Estilos del menú desplegable */
.dropdown-menu {
  position: absolute;
  top: 120%; /* Posiciona el menú un poco debajo del ícono */
  right: 0; /* Lo alinea a la derecha del contenedor */
  background-color: #bbf784; /* Un verde similar al de la imagen */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: 10px 15px;
  width: max-content; /* El ancho se ajusta al contenido */
  z-index: 100; /* Asegura que esté por encima de otros elementos */
}
.dropdown-menu ul {
  list-style-type: none; /* Quita los puntos de la lista */
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s; /* Efecto suave al pasar el ratón */
}

.dropdown-menu li:hover {
  background-color: rgba(0, 0, 0, 0.08); /* Resaltado sutil */
}
</style>