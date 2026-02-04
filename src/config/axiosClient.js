import axios from 'axios';
import { APIURL } from '.';

// Crear una instancia de Axios con configuración predeterminada
export const axiosClient = axios.create({
    baseURL: APIURL,
    headers: {
        'Content-Type': 'application/json',
    }
});