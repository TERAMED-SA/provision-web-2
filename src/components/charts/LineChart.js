import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { format } from "date-fns";

const LineChart = () => {
  const [notificationData, setNotificationData] = useState({
    labels: [],
    datasets: [
      {
        label: "Notificações e ocorrências",
        data: [],
        borderWidth: 1,
        borderColor: "rgb(75, 192, 192)",
      },
    ],
  });

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await axios.get(
          "https://provision-07c1.onrender.com/api/v1/notification/11835"
        );
        const data = response.data.data;

        // Process notification data to count occurrences per date
        const countByDate = {};
        data.forEach((notification) => {
          const date = new Date(notification.createdAt);
          const formattedDate = format(date, "dd/MM");
          countByDate[formattedDate] = (countByDate[formattedDate] || 0) + 1;
        });

        // Sort dates in ascending order
        const sortedDates = Object.keys(countByDate).sort();

        // Format data for chart.js Line chart
        const labels = sortedDates;
        const counts = sortedDates.map((date) => countByDate[date]);

        setNotificationData({
          labels: labels,
          datasets: [
            {
              label: "Notificações e ocorrências",
              data: counts,
              borderWidth: 1,
              borderColor: "rgb(75, 192, 192)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching notification data:", error.message);
      }
    };

    fetchNotificationData();
  }, []);

  return (
    <div className="bg-white border border-secondary">
      <Line data={notificationData} />
    </div>
  );
};

export default LineChart;