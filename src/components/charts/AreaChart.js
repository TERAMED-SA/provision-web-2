<<<<<<< HEAD
import { React } from "react";

import "../../../node_modules/react-vis/dist/style.css";
import {
  XYPlot,
  LineMarkSeries,
  AreaSeries,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
} from "react-vis";

const AreaChart = () => {
  // eslint-disable-next-line no-unused-vars
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
  ];

  // eslint-disable-next-line no-unused-vars
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
  ];

  return (
    <XYPlot height={300} width={400}>
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis />
      <YAxis />
      <AreaSeries
        className="area-elevated-series-1"
        color="#79c7e3"
        data={[
          { x: 1, y: 10, y0: 1 },
          { x: 2, y: 25, y0: 5 },
          { x: 3, y: 15, y0: 3 },
        ]}
      />
      <AreaSeries
        className="area-elevated-series-2"
        color="#12939a"
        data={[
          { x: 1, y: 5, y0: 6 },
          { x: 2, y: 20, y0: 11 },
          { x: 3, y: 10, y0: 9 },
        ]}
      />
      <LineMarkSeries
        className="area-elevated-line-series"
        data={[
          { x: 1, y: 5.5 },
          { x: 2, y: 15 },
          { x: 3, y: 9 },
        ]}
      />
    </XYPlot>
  );
};

export default AreaChart;
=======
/* eslint-disable no-unused-vars */
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const data = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const AreaChartComponent = () => (
    <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
            top: 10, right: 30, left: 0, bottom: 0,
        }}
    >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
);

export default AreaChartComponent;
>>>>>>> main
