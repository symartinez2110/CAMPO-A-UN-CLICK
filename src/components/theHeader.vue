<template>
  <div class="header">
    <router-link :to="{name: 'homeUser'}"><img class="icon" src="../../public/logo.png" alt="Logo Campo A un click"></router-link>
    
    <div class="title-user-container"> 
      <h1> <p class="logged-user-name" v-if="userName">Bienvenido, {{ userName }}</p></h1>
      
    </div>
    
    <div class="actions-container">
      <div class="cart-icon" title="Ver Carrito" @click="toggleCart">&#128722;</div>

      <div class="menu-container" ref="menuContainerRef">
        <div class="menu-icon" @click="toggleMenu">&#9776;</div>

        <div v-if="isMenuOpen" class="dropdown-menu">
          <ul>
            <router-link :to="{name: 'perfilUser'}">
              <li class="button">Perfil</li>
            </router-link>
            
            <router-link :to="{name: 'dashboarAdmin'}" v-if="userRole === 'campesino'">
                <li class="button">Panel de Campesino</li>
            </router-link>
            
            <router-link :to="{name: 'productosUser'}">
              <li class="button">Productos</li>
            </router-link>
            
            <li class="button" @click="logout">Cerrar sesión</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <CarritoResumenSidebar v-if="isCartOpen" @close="isCartOpen = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import useApi from '../componsables/useApi'; 
import CarritoResumenSidebar from './CarritoResumenSidebar.vue'; 

const { get, post, setAuthToken } = useApi();
const router = useRouter();

const isMenuOpen = ref(false);
const isCartOpen = ref(false); 
const menuContainerRef = ref(null);

const userName = ref(null); 
// 💡 NUEVO ESTADO: para almacenar el rol del usuario
const userRole = ref(null); 


// 💡 MODIFICADO: Ahora obtiene y guarda el rol
async function fetchUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // 🔹 Endpoint: Obtenemos toda la información del usuario logueado
    const data = await get('/auth/me'); 
    
    // 🔹 Guardar el Nombre y el Rol
    userName.value = data.Nombre || 'Usuario'; 
    userRole.value = data.rol; // <-- CLAVE: Guardamos el rol aquí

  } catch (error) {
    console.error("Error al cargar el perfil del usuario:", error);
    userName.value = 'Usuario'; 
    userRole.value = null;
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
  isCartOpen.value = false; 
}

function toggleCart() {
  isCartOpen.value = !isCartOpen.value;
  isMenuOpen.value = false; 
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
  window.addEventListener("popstate", checkAuth);
  
  // LLAMADA: Cargar el perfil (y el rol) al montar el componente
  fetchUserProfile();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener("popstate", checkAuth);
});

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace({ name: "loginUser" }); 
  }
}

async function logout() {
  try {
    await post('/auth/logout'); 
    alert("Usted a cerrado sesion")
  } catch (e) {
    console.warn("Error al cerrar sesión, pero se limpiará de todas formas");
  }

  localStorage.removeItem("token");
  setAuthToken(null);
  router.replace({ name: "loginUser" });
}
</script>


<style scoped>
/* (Mantén los estilos que proporcionaste sin cambios) */
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

.actions-container {
    display: flex;
    align-items: center;
    gap: 15px; 
    margin-right: 20px;
}

.button {
  display: flex;
  justify-content: center;
  width: 90%;
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
    height: 100px;
    width: 100px;
    margin-top: 0.5rem;
    margin-left: 0.8rem;
    font-weight: bolder;
}

.cart-icon {
    font-size: x-large;
    cursor: pointer;
    padding: 5px; 
    transition: color 0.3s;
}

.cart-icon:hover {
    color: #f9f9f9;
}

.menu-icon {
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
  top: 120%; 
  right: 0; 
  background-color: #c7f49d; 
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: 10px 15px;
  margin: 1rem;
  width: max-content; 
  z-index: 100; 
  
}
.dropdown-menu ul {
  list-style-type: none; 
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
  transition: background-color 0.2s; 
}

.dropdown-menu li:hover {
  background-color: rgba(0, 0, 0, 0.08); 
}
</style>