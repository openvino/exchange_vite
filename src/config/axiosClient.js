import axios from 'axios';

// Crear una instancia de Axios con configuración predeterminada
export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_APIURL,
    headers: {
        'Content-Type': 'application/json',
    }
});