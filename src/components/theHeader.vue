<template>
  <div class="header">
    <img class="icon" src="../../public/avatar.jpg" alt="avatar del campesino">
    <h1>Campesino 0.1</h1>
    <!-- Menu desplegable-->
    <div class="menu-container" ref="menuContainerRef">
      <div class="menu-icon" @click="toggleMenu">&#9776;</div>

      <div v-if="isMenuOpen" class="dropdown-menu">
        <ul>
          <router-link :to="{name: 'perfilUser'}">
            <li class="button">Perfil</li>
          </router-link>
          <router-link :to="{name: 'productosUser'}">
            <li class="button">Productos</li>
          </router-link>
          <li class="button" @click="logout">Cerrar sesión</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import useApi from '../componsables/useApi'; // tu helper API

const { post, setAuthToken } = useApi();
const router = useRouter();

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

  // 🔹 Bloquear retroceso/avance del navegador si no hay sesión
  window.addEventListener("popstate", checkAuth);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener("popstate", checkAuth);
});

// 🔹 Función para validar si hay sesión
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace({ name: "loginUser" }); // fuerza volver al login
  }
}

// 🔹 Función para cerrar sesión
async function logout() {
  try {
    await post('/auth/logout'); // API logout
    alert("Usted a cerrado sesion")
  } catch (e) {
    console.warn("Error al cerrar sesión, pero se limpiará de todas formas");
  }

  // Eliminar token y cabeceras
  localStorage.removeItem("token");
  setAuthToken(null);

  // Redirigir al login
  router.replace({ name: "loginUser" });
}
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

.button {
  display: flex;
  justify-content: center;
  width: 65%;
  height: 20px;
  padding: 12px;
  background-color: #AEF379;
  color: #000;
  border: none;
  border-radius: 150px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
a:-webkit-any-link {
  text-decoration: none;
  color: #000;
}

.button:hover {
  background-color: #5d9266;
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
  background-color: #c7f49d; /* Un verde similar al de la imagen */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: 10px 15px;
  margin: 1rem;
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
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s; /* Efecto suave al pasar el ratón */
}

.dropdown-menu li:hover {
  background-color: rgba(0, 0, 0, 0.08); /* Resaltado sutil */
}
</style>