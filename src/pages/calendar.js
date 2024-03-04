import React, { useState } from "react";
import "./Calendar.css"; // Importe o arquivo CSS com o estilo adicional

const Calendar = () => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const updateMonthYear = () => {
    return `${months[currentMonthIndex]} ${currentYear}`;
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentYear,
      currentMonthIndex + 1,
      0
    ).getDate();
    const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    const calendar = [];

    let date = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(<td key={`${i}-${j}`}></td>);
        } else if (date > daysInMonth) {
          week.push(<td key={`${i}-${j}`}></td>);
        } else {
          const className = getCellClassName(date);
          week.push(
            <td
              key={`${i}-${j}`}
              className={className}
              onClick={() => selectDate(date)}
            >
              {date}
            </td>
          );
          date++;
        }
      }
      calendar.push(<tr key={i}>{week}</tr>);
      if (date > daysInMonth) {
        break;
      }
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Domingo</th>
            <th>Segunda</th>
            <th>Terça</th>
            <th>Quarta</th>
            <th>Quinta</th>
            <th>Sexta</th>
            <th>Sábado</th>
          </tr>
        </thead>
        <tbody>{calendar}</tbody>
      </table>
    );
  };

  const getCellClassName = (date) => {
    if (
      selectedStartDate &&
      selectedEndDate &&
      new Date(currentYear, currentMonthIndex, date) >= selectedStartDate &&
      new Date(currentYear, currentMonthIndex, date) <= selectedEndDate
    ) {
      return "selected";
    } else if (
      date === new Date().getDate() &&
      currentYear === new Date().getFullYear() &&
      currentMonthIndex === new Date().getMonth()
    ) {
      return "today";
    } else {
      return "";
    }
  };

  const selectDate = (day) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(new Date(currentYear, currentMonthIndex, day));
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      setSelectedEndDate(new Date(currentYear, currentMonthIndex, day));
      if (selectedEndDate < selectedStartDate) {
        const temp = selectedStartDate;
        setSelectedStartDate(selectedEndDate);
        setSelectedEndDate(temp);
      }
    }
  };

  const updatePrevMonth = () => {
    let newIndex = currentMonthIndex - 1;
    let newYear = currentYear;
    if (newIndex < 0) {
      newIndex = 11;
      newYear--;
    }
    setCurrentMonthIndex(newIndex);
    setCurrentYear(newYear);
  };

  const updateNextMonth = () => {
    let newIndex = currentMonthIndex + 1;
    let newYear = currentYear;
    if (newIndex > 11) {
      newIndex = 0;
      newYear++;
    }
    setCurrentMonthIndex(newIndex);
    setCurrentYear(newYear);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <span className="prev-month" onClick={updatePrevMonth}>
          &#10094;
        </span>
        <span className="month-year">{updateMonthYear()}</span>
        <span className="next-month" onClick={updateNextMonth}>
          &#10095;
        </span>
      </div>
      <div id="calendar">{renderCalendar()}</div>
    </div>
  );
};

export default Calendar;
