<script setup>
import theHeader from '../../components/theHeader.vue';
import { ref } from "vue";

// Importamos los CRUDs
import ProductosCrud from './gestionProductos.vue';
import CategoriasCrud from './CategoriasCrud.vue';
import VentasCrud from './VentasCrud.vue';
import UsuariosCrud from './UsuariosCrud.vue';

// Controlar qué vista se muestra en el panel
const currentView = ref("productos");
</script>

<template>
  <div class="dashboard-container">
    <theHeader />

    <div class="dashboard-title-container">
      <h1 style="color: #000;">Panel De Control Campesino</h1>
    </div>

    <div class="dashboard-main-card">
            <aside class="dashboard-sidebar">
        <div class="sidebar-icon">⚙️</div>
        <ul>
          <li @click="currentView = 'ventas'">Reporte de ventas</li>
          <li @click="currentView = 'productos'">Gestionar Productos</li>
          <li @click="currentView = 'categorias'">Gestión de categorías</li>
        <!---  <li @click="currentView = 'usuarios'">Gestión de usuarios</li> -->
        </ul>
      </aside>

            <main class="dashboard-content">
        <VentasCrud v-if="currentView === 'ventas'" />
        <ProductosCrud v-if="currentView === 'productos'" />
        <CategoriasCrud v-if="currentView === 'categorias'" />
        <UsuariosCrud v-if="currentView === 'usuarios'" />
      </main>
    </div>
  </div>
</template>


<style scoped>
.dashboard-container {
display: flex;
flex-direction: column;
align-items: center;
background-image: url('/public/Fondo_Panel_user.jpg');
background-size: cover;
background-position: center;
min-height: 100vh;
padding-top: 20px;
box-sizing: border-box;
color: #000;
}

.dashboard-title-container {
margin-top: 100px; 
background-color: #cceeb3;
padding: 10px 40px;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
color: white;
text-align: center;
}

.dashboard-main-card {
display: flex;
background-color: #B5E491;
border-top-left-radius: 20px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
margin-top: 20px;
width: 90%;
max-width: 1200px;
min-height: 600px;
}

.dashboard-sidebar {
background-color: #87ee5b;
border-top-left-radius: 20px;
width: 250px;
padding: 20px;
color: #000;
display: flex;
flex-direction: column;
align-items: center;
}

.sidebar-icon {
font-size: 50px;
margin-bottom: 20px;
}

.dashboard-sidebar ul {
list-style: none;
padding: 0;
margin: 0;
width: 100%;
}

.dashboard-sidebar ul li {
padding: 10px 20px;
border-radius: 8px;
margin-bottom: 10px;
cursor: pointer;
transition: background-color 0.3s ease;
}

.dashboard-sidebar ul li:hover {
background-color: rgba(2, 43, 1, 0.2);
}

/* 🛑 CORRECCIÓN CLAVE AQUÍ: Se eliminó el display: grid para que el contenido de ventas ocupe todo el ancho. */
.dashboard-content {
flex-grow: 1;
padding: 40px;
}

.info-card {
background-color: #64b129;
border-radius: 10px;
height: 200px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>