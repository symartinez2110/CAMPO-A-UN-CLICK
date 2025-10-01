//Importaciones requeridas para la navegación
import { createRouter, createWebHistory } from "vue-router";
import loginView from '../views/viewsUser/loginView.vue'; 
import HomeView from "../views/viewsUser/HomeView.vue";
import ProductosView from "../views/viewsUser/productosView.vue";
import PerfilUserView from "../views/viewsUser/perfilUserView.vue";
import DashboarvViews from "../views/viewsAdmin/dashboarvViews.vue";
import RegistroView from "../views/viewsUser/registroView.vue";
import GestionProductos from "../views/viewsAdmin/gestionProductos.vue";
import CategoriasCrud from "../views/viewsAdmin/CategoriasCrud.vue";


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
    {
        path: '/productosUser',
        name: 'productosUser',
        component: ProductosView
    },
    {
        path: '/perfilUser',
        name: 'perfilUser',
        component: PerfilUserView
    },
    {
        path: '/registroUser',
        name: 'registroUser',
        component: RegistroView
    },

    {
        path: '/dashboarAdmin',
        name: 'dashboarAdmin',
        component: DashboarvViews,
        children: [
            {
                path: 'productos',
                component: GestionProductos
            },
            {
                path: 'categorias',
                component: CategoriasCrud
            }
        ]
    }
    ]
})

export default router