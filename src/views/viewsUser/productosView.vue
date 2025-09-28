
<script setup>
import theHeader from '../../components/theHeader.vue';
</script>

<template>
     
     <div>
    <theHeader />
  
    <!-- Panel Central -->

    <div class="panel-central">
      <div class="Productos"> <h2>PRODUCTOS</h2> </div>
      <div class="contenedores-grid">
        <div class="contenedor">
          <div class="nombre">Frutas</div>
          <div class="descripcion">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nesciunt pariatur quae nemo odio doloremque culpa consequatur placeat accusamus reprehenderit. Temporibus repellat sunt accusamus animi nam? Deserunt voluptatibus eos nesciunt facilis?</div>
        </div>
        <div class="contenedor">
          <div class="nombre">Verduras</div>
          <div class="descripcion">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt, et aut eos temporibus illum quos? Beatae maxime ipsam non perferendis aliquid debitis quae, eaque distinctio accusantium reiciendis quo, harum velit.</div>
        </div>
        <div class="contenedor">
          <div class="nombre">Legumbres</div>
          <div class="descripcion">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Error minima tempore minus dignissimos. Aspernatur quis cum non debitis iusto quidem ratione sed hic maxime. Sit adipisci inventore impedit cumque harum.</div>
        </div>
        <div class="contenedor">
          <div class="nombre">Tubérculos</div>
          <div class="descripcion">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint, consectetur exercitationem! Maiores numquam dolorum pariatur hic corporis quia eum blanditiis velit. Magnam magni obcaecati nostrum quidem. Similique excepturi nemo temporibus.</div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.panel-central {
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
.Productos {
  background-color: #86c679;
  border-radius: 20px;
  width: 300px;

}
/*input[type="text"]
{
  width: 80%;
  margin-left: 10px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #B5E491;
  font-size: 1rem;
  border: center;
}*/



/* Grid de contenedores */
.contenedores-grid {
  display: grid;
  grid-template-columns: repeat(2, 400px);
  grid-template-rows: repeat(2, 250px);
  gap: 80px;
  margin-top: 40px;
}

/* Estilo de cada contenedor */
.contenedor {
  position: relative;
  height: 250px;
  background-color:white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: bold;
  flex-direction: column;/* clave para alinear verticalmente */
 
}
.contenedor:hover {
  background-color: #6fae5a;
  transition: background-color 0.3s ease;
}

h2 {
  text-align: center;
  margin-top: 20px;
  color: black;
}
.nombre {
  display: grid;
  margin-bottom: 12rem;/*Crea espacio debajo del elemento para separarlo del que está abajo.*/
  font-size: 1.5rem;
  font-weight: bold;/* Hace que el texto sea más grueso */
  text-align: center;
  color: rgb(26, 19, 19);
  background-color: #B5E491;/* Cambia el color de fondo a un verde claro */
  border-radius: 12px;
  width: 120px;
  position: absolute;
}

.descripcion {
  margin-bottom: 1rem; /*Crea espacio debajo del elemento para separarlo del que está abajo.*/
  text-align: center;/* Centra el texto horizontalmente dentro del contenedor */
  font-weight: 300;/* Hace que el texto sea más ligero */
}

</style>
