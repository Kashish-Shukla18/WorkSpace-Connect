import React, { useEffect, useState } from "react";
import "./Calendar.css";
import Layout from "./Layout";

export default function Calendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Fetch holidays from API (India by default)
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/IN`
        );
        const data = await response.json();
        setHolidays(data);
      } catch (error) {
        console.error("Error fetching holidays", error);
        // Fallback data in case API fails
        setHolidays([
          { date: "2023-01-01", localName: "New Year's Day" },
          { date: "2023-01-26", localName: "Republic Day" },
          { date: "2023-08-15", localName: "Independence Day" },
          { date: "2023-10-02", localName: "Gandhi Jayanti" },
          { date: "2023-12-25", localName: "Christmas" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, [currentYear]);

  // Quick lookup map: YYYY-MM-DD -> holiday name
  const holidayMap = new Map(holidays.map((h) => [h.date, h.localName]));

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(currentYear, i).toLocaleString("default", { month: "long" })
  );

  const renderMonth = (monthIndex) => {
    const firstDay = new Date(currentYear, monthIndex, 1).getDay();
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty-cell" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isHoliday = holidayMap.has(dateStr);
      days.push(
        <div
          key={d}
          className={`day-cell ${isHoliday ? "holiday" : ""}`}
          title={isHoliday ? holidayMap.get(dateStr) : ""}
        >
          <span className="day-number">{d}</span>
          {isHoliday && (
            <span className="holiday-name">{holidayMap.get(dateStr)}</span>
          )}
        </div>
      );
    }

    return (
      <section key={monthIndex} className="month">
        <h2 className="month-title">{months[monthIndex]}</h2>
        <div className="calendar-grid">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
          {days}
        </div>
      </section>
    );
  };

  return (
    <Layout>
    <div className="calendar-container">
      <header className="calendar-header">
        <h1 className="calendar-title">{currentYear} Calendar</h1>
        {loading && <div className="loading">Loading holidays…</div>}
      </header>
      <div className="calendar-content">
        {!loading && months.map((_, i) => renderMonth(i))}
      </div>
    </div>
    </Layout>
  );
}