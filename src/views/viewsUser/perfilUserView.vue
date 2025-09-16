<script setup>
import theHeader from '../../components/theHeader.vue';
</script>

<template>
  <div class="main-view-container">
    <theHeader />

    <div class="profile-card">

      <div class="card-header">
        <div class="profile-image">
          <img src="/public/foto_user.png" alt="Profile" />
        </div>
        
        <button class="edit-button">
          <span class="edit-icon">✏️</span>
          <span>EDITAR</span>
        </button>
      </div>

      <div class="data-container">
        <div class="data-field">Dato 1</div>
        <div class="data-field">Dato 2</div>
        <div class="data-field">Dato 3</div>
        <div class="data-field">Dato 4</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS para reutilizar colores fácilmente. */
:root {
  --color-primary: #86c679; /* El color verde de la imagen. */
  --color-background-card: #ffffff; /* Blanco de la tarjeta. */
  --color-edit-text: #666; /* Color del texto "EDITAR". */
  --color-border: #ddd; /* Color del borde para la sombra. */
}

.main-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* La imagen de fondo. Reemplaza la URL con la ruta de tu imagen. */
  background-image: url('/public/Fondo_Panel_user.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding-top: 1rem;
  box-sizing: border-box;
}

.profile-card {
  background-color: #B5E491;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 90%;
  max-width: 600px;
  /* Posicionamiento en el centro de la vista. */
  margin-top: 100px; /* Para dejar espacio al encabezado. */
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  margin-bottom: 20px;
}

.profile-image img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--color-background-card);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover; /* Asegura que la imagen no se distorsione. */
}

.edit-button {
  position: absolute;
  top: -10px; /* Ajusta la posición vertical. */
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-edit-text);
  font-size: 14px;
}

.edit-icon {
  margin-right: 5px;
  font-size: 16px;
}

.data-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.data-field {
  background-color: seagreen;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  flex: 1 1 calc(50% - 10px); /* Ocupa el 50% del ancho con un pequeño espacio. */
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .data-field {
    flex-basis: 100%; /* En pantallas más pequeñas, ocupa todo el ancho. */
  }
}
</style>