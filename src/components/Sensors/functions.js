import axios from "axios";
import { APIURL } from "../../config";

export function getSensorsData(wineryId, year, month, day) {
    
    const filterType = day ? "day" : month ? "month" : "year";  

    // Construcción de parámetros para la URL
    let params = [];
    if (wineryId) params.push(`winerie_id=${wineryId}`);
    if (year) params.push(`year=${month > 4 ? year - 1 : year}`);
    
    if (month) params.push(`month=${month}`);
    if (day) params.push(`day=${day}`);
    const queryString = params.length > 0 ? `?${params.join("&")}` : "";
    // Solicitud a la API
    return axios.get(`${APIURL}/sensor_data${queryString}`)
        .then((response) => {
            const data = response.data;
            const baseDate = new Date(year, month || 0, day || 1);
            
            return {
                soilHumidity: getHeatMap(data, filterType, baseDate),
                temperature: generateLinearChartData(data, "temperature", "ºC", filterType, baseDate),
                windSpeed: generateLinearChartData(data, "wind_velocity", "knots", filterType, baseDate),
                humidity: generateLinearChartData(data, "humidity", "%", filterType, baseDate),
                pressure: generateLinearChartData(data, "pressure", "", filterType, baseDate),
                rain: generateLinearChartData(data, "rain", "mm", filterType, baseDate),
                windDirection: generateLinearChartData(data, "wind_direction", "º", filterType, baseDate),
                irradianceUV: generateLinearChartData(data, "irradiance_uv", "", filterType, baseDate),
                irradianceIR: generateLinearChartData(data, "irradiance_ir", "", filterType, baseDate),
                irradianceVI: generateLinearChartData(data, "irradiance_vi", "", filterType, baseDate),
            };
        })
        .catch((error) => {
            console.error("Error fetching sensor data:", error);
            throw error;
        });
}

function getHeatMap(data, filterType, date) {
    let result = {};

    HEATMAP_TABS.forEach((sensor) => {
        let sensorData = data.filter((value) => {
            return value.sensor_id === sensor.id;
        });

        sensorData = sensorData.map((item) => {
            let date = new Date(item.timestamp);
            return {
                date: date,
                data: [
                    Math.round((item.humidity005 * 100) / 254),
                    Math.round((item.humidity05 * 100) / 254),
                    Math.round((item.humidity1 * 100) / 254),
                    Math.round((item.humidity2 * 100) / 254),
                ],
                units: "%",
                label: null,
                hash: [item.hash],
            };
        });

        let filled = [];
        switch (filterType) {
            case "year":
                MONTHS.forEach((month) => {
                    let itemData = [];
                    sensorData.forEach((item) => {
                        if (item.date.getMonth() == month) {
                            itemData.push(item);
                        }
                    });

                    if (itemData.length === 0) {
                        filled.push(
                            {
                                date: new Date(date.getFullYear()),
                                data: [null, null, null, null],
                                units: "%",
                                label: `months.${month}`,
                                hash: null,
                            }
                        );
                    } else {
                        filled.push(
                            {
                                date: itemData[0].date,
                                data: getHeatmapArrayAverage(itemData),
                                units: itemData[0].units,
                                label: `months.${month}`,
                                hash: null,
                            }
                        );
                    }
                });
                break;
            case "month":
                let daysInMonth = new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    0
                ).getDate();
                for (let day = 1; day <= daysInMonth; ++day) {
                    let itemData = [];
                    sensorData.forEach((item) => {
                        if (item.date.getDate() == day) {
                            itemData.push(item);
                        }
                    });

                    if (itemData.length === 0) {
                        filled.push(
                            {
                                date: new Date(date.getFullYear(), date.getMonth(), day),
                                data: [null, null, null, null],
                                units: "%",
                                label: day.toString(),
                                hash: null,
                            }
                        );
                    } else {
                        filled.push(
                            {
                                date: itemData[0].date,
                                data: getHeatmapArrayAverage(itemData),
                                units: itemData[0].units,
                                label: day.toString(),
                                hash: null,
                            }
                        );
                    }
                }
                break;

            case "day":
                for (let hour = 0; hour < 24; ++hour) {
                    let itemData = [];
                    sensorData.forEach((item) => {
                        if (item.date.getUTCHours() == hour) {
                            itemData.push(item);
                        }
                    });

                    if (itemData.length === 0) {
                        filled.push(
                            {
                                date: new Date(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    date.getDate()
                                ),
                                data: [null, null, null, null],
                                units: "%",
                                label: `${hour}:00`,
                                hash: null,
                            }
                        );
                    } else {
                        filled.push(
                            {
                                date: itemData[0].date,
                                data: getHeatmapArrayAverage(itemData),
                                units: itemData[0].units,
                                label: `${hour}:00`,
                                hash: null,
                            }
                        );
                    }
                }
                break;
        }

        result[sensor.id] = filled;
    });

    return result;
}

function generateLinearChartData(data, param, units, filterType, date) {
    const result = data.map((item) => {
        const itemDate = new Date(item.timestamp);
        return {
            date: itemDate,
            data: item[param],
            units: units,
            label: null,
            hash: [item.hash],
        };
    });
    const filled = [];

    switch (filterType) {
        case "year":
            MONTHS.forEach((month) => {
                const itemData = result.filter((item) => item.date.getMonth() === month);

                if (itemData.length === 0) {
                    filled.push(
                        {
                            date: new Date(date.getFullYear(), month, 1),
                            data: null,
                            units: units,
                            label: `months.${month}`,
                            hash: null,
                        }
                    );
                } else {
                    filled.push(
                        {
                            date: itemData[0].date,
                            data: getLinearChartArrayAverage(itemData),
                            units: itemData[0].units,
                            label: `months.${month}`,
                            hash: null,
                        }
                    );
                }
            });
            break;

        case "month":
            const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; ++day) {
                const itemData = result.filter((item) => item.date.getDate() === day);

                if (itemData.length === 0) {
                    filled.push(
                        {
                            date: new Date(date.getFullYear(), date.getMonth(), day),
                            data: null,
                            units: units,
                            label: day.toString(),
                            hash: null,
                        }
                    );
                } else {
                    filled.push(
                        {
                            date: itemData[0].date,
                            data: getLinearChartArrayAverage(itemData),
                            units: itemData[0].units,
                            label: day.toString(),
                            hash: null,
                        }
                    );
                }
            }
            break;

        case "day":
            for (let hour = 0; hour < 24; ++hour) {
                const itemData = result.filter((item) => item.date.getUTCHours() === hour);

                if (itemData.length === 0) {
                    filled.push(
                        {
                            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour),
                            data: null,
                            units: units,
                            label: `${hour}:00`,
                            hash: null,
                        }
                    );
                } else {
                    filled.push(
                        {
                            date: itemData[0].date,
                            data: getLinearChartArrayAverage(itemData),
                            units: itemData[0].units,
                            label: `${hour}:00`,
                            hash: null,
                        }
                    );
                }
            }
            break;
    }

    return filled;
}




function getHeatmapArrayAverage(array) {
    if (array.length > 1) {
        return [
            array.reduce((a, b) => a + b.data[0], 0) /
            array.length,
            array.reduce((a, b) => a + b.data[1], 0) /
            array.length,
            array.reduce((a, b) => a + b.data[2], 0) /
            array.length,
            array.reduce((a, b) => a + b.data[3], 0) /
            array.length,
        ];
    } else {
        return [
            array[0].data[0],
            array[0].data[1],
            array[0].data[2],
            array[0].data[3],
        ];
    }
}


function getLinearChartArrayAverage(array) {
    let sum = 0;
    array.forEach((item) => {
        sum += item.data;
    });

    return sum / array.length;
}


export const HEATMAP_TABS = [
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
]

export const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
