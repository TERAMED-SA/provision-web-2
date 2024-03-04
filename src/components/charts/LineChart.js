/* eslint-disable no-unused-vars */
import React from "react";
import { Line } from "react-chartjs-2";

const data = {
  labels: ["Jan", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1,
    },
  ],
};

function LineChart() {
  return (
    <div className="bg-white border border-secondary">
      <Line data={data} />
    </div>
  );
}

export default LineChart;
