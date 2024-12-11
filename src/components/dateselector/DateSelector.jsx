import React, { useState, useEffect } from "react";
import styles from "./DateSelector.module.css";
import { useTranslation } from "react-i18next";

const DateSelector = ({ year, onDateChange }) => {




    const { t } = useTranslation();

    const [months] = useState([4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3]);
    const [days, setDays] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState(null);

    const getYearByMonth = (month) => {
        return month >= 4 ? year - 1 : year;
    };

    useEffect(() => {
        onSelectChange();

    }, [selectedMonth]); // Recalcula los días cada vez que cambia el mes seleccionado

    const onSelectChange = (clearDay = false) => {
        if (clearDay) {
            setSelectedDay(null);
        }

        if (selectedMonth !== null) {
            const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
            setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        }

        if (onDateChange) {
            onDateChange({
                year: getYearByMonth(selectedMonth),
                month: selectedMonth !== null ? selectedMonth + 1 : null,
                day: selectedDay,
            });
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(Number(event.target.value));
    };

    const handleDayChange = (event) => {
        setSelectedDay(Number(event.target.value));
        onSelectChange();
    };

    return (
        <div className={styles["date-selector-container"]}>
            <div className={styles["date-selector"]}>
                <select value={selectedMonth || ""} onChange={handleMonthChange}>
                    <option value="" disabled>
                        Select Month
                    </option>
                    {months.map((month) => (
                        <option key={month} value={month}>
                            {`${getYearByMonth(month)} ${t(`months.${month}`)}`}
                        </option>
                    ))}
                </select>
            </div>

            {selectedMonth !== null && (
                <div className={styles["date-selector"]}>
                    <select value={selectedDay || ""} onChange={handleDayChange}>
                        <option value="">{t("labels.none")}</option>
                        {days.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default DateSelector;
