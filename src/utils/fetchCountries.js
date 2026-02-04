import axios from 'axios'
import dotenv from 'dotenv'
import { DASHBOARD_URL } from '../config'

dotenv.config()

export const fetchCountries = async () => {
    const countries = await axios.get(`${DASHBOARD_URL}/api/routes/zonesRoute`)
    return countries;
}
