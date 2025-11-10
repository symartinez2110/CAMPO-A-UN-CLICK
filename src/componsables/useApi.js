// src/componsables/useApi.js

import axios from "axios";
import { ref } from "vue";

// Crear una constante que me almacene la ruta para consumir la api 
// 🚨 Asegúrate de que esta URL es correcta para tu servidor 🚨
const baseURL = 'http://10.2.35.76:3000' 

const api = axios.create({baseURL})

export default function useApi(){
    const cargar = ref(false)
    const error = ref(null)

    // Función para obtener las cabeceras de autenticación (SIN Content-Type fijo)
    const getBaseHeaders = () => {
        const token = localStorage.getItem('token');
        const headers = {};
        // Si hay token, lo añadimos para que las peticiones protegidas funcionen
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }
        return headers;
    };


    const respuesta = async (method, url, data = null, config = {}) =>{
        cargar.value = true
        error.value = null
        try{
            const normalizedMethod = method.toLowerCase();
            const finalHeaders = getBaseHeaders();
            
            // Los métodos que envían cuerpo (y por lo tanto, JSON o FormData)
            const isDataMethod = ['post', 'put', 'patch'].includes(normalizedMethod);
            
            // 🚨 CORRECCIÓN CLAVE 🚨: Solo forzar JSON si los datos NO son FormData
            if (isDataMethod && data && !(data instanceof FormData) && !config.headers?.['Content-Type']) {
                 finalHeaders['Content-Type'] = 'application/json';
            }
            
            // Unimos todas las cabeceras
            const finalConfig = {
                ...config,
                headers: {
                    ...finalHeaders,     
                    ...config.headers,   
                },
            };
            
            // 🚨 CLAVE ADICIONAL 🚨: Si es FormData, nos aseguramos de no enviar Content-Type.
            // Axios lo maneja automáticamente, pero si el Content-Type fue forzado antes, 
            // esta línea lo quita para asegurar que el navegador use 'multipart/form-data'.
            if (data instanceof FormData && finalConfig.headers['Content-Type']) {
                 delete finalConfig.headers['Content-Type'];
            }


            const res = await api({method, url, data, ...finalConfig})
            return res.data
        }catch (err){
            error.value = err.response?.data?.error || err.response?.data?.message || err.response?.data || err.message
            throw err
        } finally{
            cargar.value = false
        }
    }

    //Crear las peticiones 
    const get = (url, config) => respuesta('get', url, null, config)
    const post = (url, data, config) => respuesta('post', url, data, config)
    const put = (url, data, config) => respuesta('put', url, data, config)
    const del = (url, config) => respuesta('delete', url, null, config)

    const setAuthToken = token =>{
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        else delete api.defaults.headers.common['Authorization']
    }

    return {
        cargar,
        error,
        get,
        post,
        put,
        del,
        setAuthToken
    }
}