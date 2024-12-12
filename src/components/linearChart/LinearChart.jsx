import React, { useEffect, useRef } from "react";
import { Colors,Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler } from "chart.js";

// Registra los componentes necesarios de Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale,Colors,Filler);
const LinearChart = ({ data = [], min, max }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    // Destruir el gráfico existente si ya está creado
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Crear gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, "rgba(213, 132, 27, .61)");  // Color inicial
    gradient.addColorStop(1, "rgba(213, 132, 27, .11)");  // Color final

    // Crear el gráfico
    chartRef.current = new Chart(ctx, {
      type: "line",

      data: {
        datasets: [
          {
            label: "Dataset 1",  // Puedes cambiar el nombre del dataset según tus datos
            data: data?.map((item) => item.data),  // Usamos los datos proporcionados
            borderColor: "rgba(213, 132, 27, .61)",  // Color de la línea
            borderWidth: 2,
            pointBackgroundColor: "rgb(213, 132, 27)",  // Color de los puntos
            backgroundColor: gradient,
          },
        ],
        labels: data?.map((item) => item.label),
      },
      options: {
        showLines: true,
        maintainAspectRatio: false, // No mantener el aspecto fijo
        responsive: true, // El gráfico debe ser sensible al tamaño del contenedor
        plugins: {
         filler: {
          propagate: true
         },
          legend: {
            display: false,  // Desactivamos la leyenda
          },
          tooltip: {
            enabled: false,  // Desactivamos el tooltip
          },
        },
        scales: {
          y: {
            ticks: {
              font: {
                family: "Futura",
              },
              color: "#9a999e",
              fontSize: 10,
              padding: 15,
              min: min,
              max: max,
            },
          },
          x: {
            ticks: {
              font: {
                family: "Futura",
              },
              color: "#9a999e",
              fontSize: 10,
              padding: 15,
            },
            grid: {
              display: false,  // Ocultamos las líneas de la cuadrícula en el eje X
            },
          },
        },
      },
    });
  }, [data, min, max]);

  // Limpieza cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ padding: "24px 0px" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "270px" }} />
    </div>
  );
};

export default LinearChart;
