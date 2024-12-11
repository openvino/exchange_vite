import React, { useState, useEffect } from 'react';
import styles from './HeatMap.module.css';

const Heatmap = ({ data, filterType }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [zoneData, setZoneData] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [activeZone, setActiveZone] = useState(null);

  const tabs = ["Petit Verdot", "Cabernet Sauvignon", "Malbec Oeste", "Malbec Este"];
  const zones = ["0.2m", "0.5m", "1.0m", "2.0m"];

  useEffect(() => {
    if (data && tabs[activeTab]) {
      setZoneData(data[filterType] || []);
    }
  }, [data, filterType, activeTab]);

  const getColor = (value) => {
    if (value === null || value === "-") return "transparent";
    const color1 = [213, 132, 27];
    const color2 = [2, 179, 190];
    const valuePercent = Math.min(Math.max(value / 100, 0), 1);
    const rgb = color1.map((c, i) => Math.round(c * valuePercent + color2[i] * (1 - valuePercent)));
    return `rgb(${rgb.join(",")})`;
  };

  const handleDataClick = (dayIndex, zoneIndex) => {
    if (zoneData[dayIndex]?.data[zoneIndex] !== null) {
      setActiveDay(dayIndex);
      setActiveZone(zoneIndex);
      alert(`Day: ${zoneData[dayIndex]?.date}, Zone: ${zones[zoneIndex]}`);
    }
  };

  return (
    <div className={styles["heatmap"]}>
      <div className={styles["heatmap-tabs"]}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`${styles["heatmap-tabs-item"]} ${index === activeTab ? styles["heatmap-tabs-item-active"] : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className={styles["heatmap-chart"]}>
        <div className={styles["heatmap-chart-content"]}>
          <div className={styles["heatmap-chart-label-y"]}>
            {zones.map((zone, i) => (
              <div key={i} className={styles["heatmap-chart-row-label"]}>{zone}</div>
            ))}
          </div>
          <div className={styles["heatmap-chart-data"]}>
            {zoneData.map((day, dayIndex) => (
              <div key={dayIndex} className={styles["heatmap-chart-row"]}>
                {zones.map((_, zoneIndex) => (
                  <div
                    key={zoneIndex}
                    className={`${styles["heatmap-chart-row-data"]} ${
                      activeDay === dayIndex && activeZone === zoneIndex ? styles["active"] : ""
                    }`}
                    style={{ backgroundColor: getColor(day.data[zoneIndex]) }}
                    onClick={() => handleDataClick(dayIndex, zoneIndex)}
                  >
                    {day.data[zoneIndex] || "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;