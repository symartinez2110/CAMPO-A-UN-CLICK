<script setup>
import theHeader from '../../components/theHeader.vue';
import { ref } from "vue";

// Importamos los CRUDs existentes
import UsuariosCrud from './UsuariosCrud.vue';
// 🟢 Importamos el CRUD de Categorías
import CategoriasCrud from './CategoriasCrud.vue'; 

// Controlar qué vista se muestra en el panel
// 🟢 Cambiado el valor inicial a 'productos' o 'ventas' según prefieras. Dejaré 'productos'.
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
            <li @click="currentView = 'categorias'">Gestión de Categorías</li>
            <li @click="currentView = 'usuarios'">Gestión de Usuarios</li>
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
/* NOTA: Los estilos CSS se mantienen *exactamente* igual a como los proporcionaste, ya que son responsivos y bien estructurados, solo he ajustado el HTML/Script. */
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
overflow-x: hidden;
}

.dashboard-title-container {
margin-top: 100px;
background-color: #cceeb3;
padding: 10px 40px;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
color: white; /* El h1 dentro tiene color: #000; */
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
flex-shrink: 0; /* Evita que se encoja en pantallas grandes */
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
/* Aseguramos un padding vertical más pequeño para móviles */
}

.info-card {
background-color: #64b129;
border-radius: 10px;
height: 200px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ================================================================= */
/* 📱 RESPONSIVIDAD (AÑADIDA) */
/* ================================================================= */

/* Para tabletas (entre 769px y 1024px) */
@media (max-width: 1024px) {
    .dashboard-main-card {
        width: 95%; /* Un poco más de ancho */
        min-height: 400px; /* Reducir la altura mínima */
    }

    .dashboard-sidebar {
        width: 200px; /* Sidebar un poco más estrecha */
        padding: 15px;
    }

    .dashboard-sidebar ul li {
        padding: 8px 15px;
        font-size: 0.9rem;
    }

    .dashboard-content {
        padding: 30px;
    }
}

/* Para dispositivos móviles (hasta 768px) */
@media (max-width: 768px) {
    .dashboard-title-container {
        margin-top: 80px;
        padding: 10px 20px;
    }

    .dashboard-title-container h1 {
        font-size: 1.5rem;
    }
    
    .dashboard-main-card {
        flex-direction: column; /* Apila sidebar y contenido */
        width: 95%;
        margin-top: 10px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px; /* Para que la tarjeta se vea mejor apilada */
    }

    .dashboard-sidebar {
        width: 94%; /* Ocupa todo el ancho superior */
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        border-bottom-left-radius: 0; /* Eliminar el radio inferior izquierdo */
        padding: 15px 10px;
    }

    .sidebar-icon {
        display: none; /* Ocultar el ícono grande para ahorrar espacio */
    }

    .dashboard-sidebar ul {
        display: flex; /* Muestra los elementos en línea horizontal */
        flex-wrap: wrap; /* Permite que se envuelvan si no caben */
        justify-content: center;
        gap: 8px; /* Espacio entre los botones */
    }

    .dashboard-sidebar ul li {
        padding: 8px 12px;
        font-size: 0.85rem;
        text-align: center;
        margin-bottom: 0; /* Eliminar margen inferior */
        flex-grow: 1; /* Permite que los elementos crezcan para ocupar el espacio */
        min-width: fit-content;
    }

    .dashboard-content {
        padding: 20px 15px; /* Reducir el padding */
        min-height: auto; /* Dejar que el contenido defina la altura */
        width: 100%; /* Asegura que ocupe todo el ancho */
    }
}
</style>