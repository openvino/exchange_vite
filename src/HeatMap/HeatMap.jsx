import React, { useState, useEffect } from 'react';
import styles from './HeatMap.module.css';
import { useTranslation } from 'react-i18next';
import { getSensorsData } from '../components/Sensors/functions';
import { useAppContext } from '../context';

const Heatmap = ({ filterType, selectedDay, selectedMonth, }) => {
  const { t } = useTranslation();
  const [state] = useAppContext();
  const [activeTab, setActiveTab] = useState('petit-verdot');
  const [zoneData, setZoneData] = useState();
  const [activeDay, setActiveDay] = useState(null);
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSensorsData(state.tokenWineryId, state.tokenYear, selectedMonth + 1,selectedDay);
      setZoneData(response.soilHumidity[activeTab]);

      console.log(response.soilHumidity);
      
    }

    if (state.tokenYear) {
      fetchData();
    }
  }, [state.tokenYear, selectedMonth, state.tokenYear, activeTab, selectedDay]);

  const tabs = [
    {
      id: 'petit-verdot',
      name: "product.subsoil_humidity.zones.petit_verdot"
    },
    {
      id: 'cabernet-sauvignon',
      name: "product.subsoil_humidity.zones.cabernet_sauvignon"
    },
    {
      id: 'malbec-oeste',
      name: "product.subsoil_humidity.zones.malbec_oeste"
    },
    {
      id: 'malbec-este',
      name: "product.subsoil_humidity.zones.malbec_este"
    },
  ];

  const zones = ["0.2m", "0.5m", "1.0m", "2.0m"];

  // Función para determinar el color según el valor
  const getColor = (value) => {
    if (value === null || value === "-") return "transparent";
    const color1 = [213, 132, 27]; // Color para valores bajos
    const color2 = [2, 179, 190];  // Color para valores altos
    const valuePercent = Math.min(Math.max(value / 100, 0), 1);
    const rgb = color1.map((c, i) => Math.round(c * valuePercent + color2[i] * (1 - valuePercent)));
    return `rgb(${rgb.join(",")})`;
  };

  // Obtener el ancho de cada celda
  const getElementWidth = () => {
    switch (filterType) {
      case 'year':
        return 70;
      case 'month':
        return 30;
      case 'day':
        return 30;
      default:
        return 30;
    }
  };

  function getValueForDayAndZone(day, zone) {

    if (zoneData) {
      return zoneData[day]?.data[zone] === null
        ? "-"
        : zoneData[day]?.data[zone];
    }

  }

  const isActive = (day, zone) => {
    return day === activeDay && zone === activeZone;
  };

  const getDayCount = () => {
    return Array.from(Array(zoneData?.length).keys());
  };

  return (
    <div className={styles["heatmap"]}>
      <div className={styles["heatmap-tabs"]}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles["heatmap-tabs-item"]} ${activeTab === tab.id ? styles["heatmap-tabs-item-active"] : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(tab.name)}
          </div>
        ))}
      </div>

      <div className={styles["heatmap-chart"]}>
        <div className={styles["heatmap-chart-content"]}>
          <div className={styles["heatmap-chart-label-y"]}>
            {zones.map((zone, i) => (
              <div key={i} className={styles["heatmap-chart-row-label"]}>{zone}</div>
            ))}
            <div className={styles["heatmap-chart-row-label"]} style={{ marginTop: '21px' }}>
              {t('labels.day')}
            </div>
          </div>


          <div className={styles["heatmap-chart-data"]}>
            <div className={styles["heatmap-chart-data-container"]}>
              {zones.map((zone, zoneIndex) => (
                <div key={zoneIndex} className={styles["heatmap-chart-row"]}>
                  {getDayCount().map((day, dayIndex) => {
                    return <div
                      key={dayIndex}
                      className={`${styles["heatmap-chart-row-data"]} ${isActive(day, zoneIndex) ? styles["heatmap-chart-row-data-active"] : ""}`}
                      style={{
                        minWidth: `${getElementWidth()}px`,
                        backgroundColor: getColor(getValueForDayAndZone(day, zoneIndex)),
                      }}
                    >
                      {getValueForDayAndZone(day, zoneIndex)}
                    </div>
                  })}
                </div>
              ))}

              <div className={styles["heatmap-chart-divider"]} style={{ minWidth: `${(getDayCount().length - 1) * getElementWidth()}px` }}></div>

            </div>


          </div>
        </div>
      </div>

      <div className={styles["heatmap-chart-row"]} style={{ minWidth: `${(getDayCount().length - 1) * getElementWidth()}px` }}>
        {getDayCount().map((day, dayIndex) => (
          <div
            key={dayIndex}
            className={styles["heatmap-chart-row-label-x"]}
            style={{ minWidth: `${getElementWidth()}px` }}
          >
           {zoneData?.[dayIndex]?.label || '-'}
          </div>
        ))}
      </div>
      <div className={styles["heatmap-legend"]}>
        <div className={styles["heatmap-legend-label"]}>{t('labels.wet')}</div>
        <div className={styles["heatmap-legend-gradient"]}></div>
        <div className={styles["heatmap-legend-label"]}>{t('labels.dry')}</div>
      </div>
    </div>
  );
};

export default Heatmap;
