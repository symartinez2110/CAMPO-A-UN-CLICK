// Importar dependencias necesarias 
import axios from "axios";
import { ref } from "vue";

//Crear una constante que me almacene la ruta para consumir la api 
const baseURL = 'http://192.168.1.42:3000'
// aqui se decide a que servidor apuntar 
const api = axios.create({baseURL})
//Aun no se para que sirve esto 
export default function useApi(){
  const cargar = ref(false)
  const error = ref(null)

  const respuesta = async (method, url, data = null, config = {}) =>{
    cargar.value = true
    error.value = null
    try{
      const res = await api({method, url, data, ...config})
      return res.data
    }catch (err){
      error.value = err.response?.data?.message || err.response?.data || err.message
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

return{ api, get, post, put, del, cargar, error, setAuthToken}
}