import React, { useEffect, useRef } from 'react';
import simplyCountdown from 'simplycountdown.js';
import './styles.css';

const Countdown = ({ year, month, day, hours, minutes, seconds }) => {
    const countdownRef = useRef(null);

    useEffect(() => {
        if (countdownRef.current) {
            // Limpia el contenido antes de volver a iniciar el contador
            countdownRef.current.innerHTML = '';

            simplyCountdown(countdownRef.current, {
                year: year || 2025,
                month: month || 5,
                day: day || 1,
                hours: hours || 0,
                minutes: minutes || 0,
                seconds: seconds || 0,
                words: {
                    days: { root: 'day', lambda: (root, n) => n > 1 ? root + 's' : root },
                    hours: { root: 'h', lambda: (root, n) => n > 1 ? root + 's' : root },
                    minutes: { root: 'min', lambda: (root, n) => n > 1 ? root + 's' : root },
                    seconds: { root: 'sec', lambda: (root, n) => n > 1 ? root + 's' : root }
                },
                refresh: 1000,
                sectionClass: 'simply-section',
                amountClass: 'simply-amount',
                wordClass: 'simply-word',
                zeroPad: true,
                countUp: false,
                onEnd: () => console.log('Countdown ended!')
            });
        }

        // Cleanup para evitar múltiples instancias
        return () => {
            if (countdownRef.current) {
                countdownRef.current.innerHTML = '';
            }
        };
    }, [year, month, day, hours, minutes, seconds]);

    return <div ref={countdownRef} className='simply-countdown-dark'></div>;
};

export default Countdown;
