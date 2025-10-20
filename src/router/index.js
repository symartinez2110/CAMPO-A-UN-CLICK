// Importaciones requeridas para la navegación
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router"; // CAMBIO 1: Usar createWebHashHistory
import loginView from '../views/viewsUser/loginView.vue'; 
import HomeView from "../views/viewsUser/HomeView.vue";
import ProductosView from "../views/viewsUser/productosView.vue";
import PerfilUserView from "../views/viewsUser/perfilUserView.vue";
import DashboarvViews from "../views/viewsAdmin/dashboarvViews.vue";
import RegistroView from "../views/viewsUser/registroView.vue";
import GestionProductos from "../views/viewsAdmin/gestionProductos.vue";
import CategoriasCrud from "../views/viewsAdmin/CategoriasCrud.vue";
import CarritoUser from "../components/Carrito.vue";


// Bloque para la navegacion 

const router = createRouter({
    // CAMBIO 2: Aplicar el modo hash
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
        path: '/carrito', 
        name: 'carritoUser', 
        component: CarritoUser 
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

// CAMBIO 3: Guard Global de Autenticación
router.beforeEach((to, from, next) => {
    // Definir rutas públicas (sin autenticación requerida)
    const publicRoutes = ['loginUser', 'registroUser']; 
    
    // Obtener el token de localStorage
    const token = localStorage.getItem('token');
    
    // Determinar si la ruta requiere autenticación
    const requiresAuth = !publicRoutes.includes(to.name);

    // 1. Si la ruta es PROTEGIDA y NO hay token, redirigir al login.
    if (requiresAuth && !token) {
        // Redirige al usuario al login, impidiendo que escriba URLs protegidas.
        next({ name: 'loginUser' });
    } 
    // 2. Si hay token PERO está intentando ir al login o registro, redirigir a una página protegida (e.g., productos).
    else if (token && publicRoutes.includes(to.name)) {
        // Redirige al dashboard de usuario, impidiendo que vea el login mientras está autenticado.
        next({ name: 'productosUser' });
    } 
    // 3. Permite la navegación (hay token y la ruta es protegida, o no hay token y la ruta es pública).
    else {
        next();
    }
});

export default router