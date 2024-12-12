import React, { useEffect, useState } from 'react'
import styles from './Sensors.module.css';
import Heatmap from '../../HeatMap/HeatMap';
import DateSelector from '../dateselector/DateSelector';
import { useAppContext } from '../../context';
import LinearChart from '../linearChart/LinearChart';
const Sensors = () => {

    const [state] = useAppContext();
    const [data, setData] = useState([]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState(null);

 

    return (
        <div className="container">
            <h2 className="text-center mt-5">Sensores</h2>

            <div className={styles['date-selector']}>
                <DateSelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} year={state.tokenYear} />

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
                <Heatmap data={data} filterType={'day'} selectedDay={selectedDay} selectedMonth={selectedMonth} />
            </div>


           


        </div>
    );

}

export default Sensors