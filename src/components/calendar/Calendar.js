import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Calendar.css';

const CalendarInfo = () => {
    const [startDate, setStartDate] = useState(new Date());

    const handleDateChange = (date) => {
        setStartDate(date);

        const day = date.getDate();
        const month = date.getMonth() + 1; // Os meses são indexados em 0
        const year = date.getFullYear();

        console.log('Dia:', day);
        console.log('Mês:', month);
        console.log('Ano:', year);
    };

    return (
        <div className="calendar-container">
            <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />
            <div className="date-info">
                <p>Dia: {startDate.getDate()}</p>
                <p>Mês: {startDate.getMonth() + 1}</p>
                <p>Ano: {startDate.getFullYear()}</p>
            </div>
        </div>
    );
};

export default CalendarInfo;
