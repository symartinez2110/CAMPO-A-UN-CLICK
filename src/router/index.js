//Importaciones requeridas para la navegación
import { createRouter, createWebHistory } from "vue-router";
import loginView from '../views/loginView.vue'; 
import HomeView from "../views/HomeView.vue";


// Bloque para la navegacion 

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
    {
        path: '/loginUser',
        name: 'loginUser',
        component: loginView
    },
    //Ruta para la redireccion 
    {
        path: '/',
        redirect: '/loginUser',
    
    },
    {
        path: '/homeUser',
        name: 'homeUser',
        component: HomeView
    },
    //Mas rutas para el proyecto en la parte visual
    ]
})

export default router