/* eslint-disable no-unused-vars */
import React from 'react';
import '../../../node_modules/react-vis/dist/style.css';
import { XYPlot, LineSeries, XAxis, YAxis, VerticalGridLines, HorizontalGridLines } from 'react-vis';
import { chart } from "chart.js/auto";

const LineChart = () => {
  const data = [
    { x: 0, y: 8 },
    { x: 1, y: 5 },
    { x: 2, y: 4 },
    { x: 3, y: 9 },
    { x: 4, y: 1 },
    { x: 5, y: 7 },
    { x: 6, y: 6 },
    { x: 7, y: 3 },
    { x: 8, y: 2 },
  ]

  const data2 = [
    { x: 0, y: 4 },
    { x: 1, y: 7 },
    { x: 2, y: 2 },
    { x: 3, y: 9 },
    { x: 4, y: 4 },
    { x: 5, y: 7 },
    { x: 6, y: 9 },
    { x: 7, y: 3 },
    { x: 8, y: 6 },
  ]

  return (
    <div style={{ marginTop: '15px' }}>
      <XYPlot height={300} width={500}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <LineSeries data={data} color="red" />
        <LineSeries data={data2} color="blue" />
      </XYPlot>
    </div>
  );
}

export default LineChart;
