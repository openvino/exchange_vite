import React, { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Sensors.module.css';
import Heatmap from '../../HeatMap/HeatMap';
import DateSelector from '../dateselector/DateSelector';
import { AppContext, useAppContext } from '../../context';
import axios from 'axios';
import { getSensorsData } from './functions';
const Sensors = () => {

    const [state] = useAppContext();
    const [data, setData] = useState([]);

    return (
        <div className="container">
            <h2 className="text-center mt-5">Sensores</h2>


            <div className={styles['date-selector']}>
                <DateSelector year={state.tokenYear} />

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
                <Heatmap data={data} filterType={'day'} />
            </div>


        </div>
    );

}

export default Sensors