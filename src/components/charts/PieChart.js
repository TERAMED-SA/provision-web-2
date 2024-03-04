/* eslint-disable no-unused-vars */
import React from "react";
// eslint-disable-next-line no-unused-vars
import { chart } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const data = {
  labels: ["Jan", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      borderWidth: 1,
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(25, 99, 132)",
      data: [12, 19, 3, 5, 2, 3],
    },
  ],
};

function PieChart() {
  return (
    <div className="bg-white border border-secondary">
      <Pie data={data} />
    </div>
  );
}

export default PieChart;
