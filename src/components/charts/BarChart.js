<<<<<<< HEAD
/* eslint-disable no-unused-vars */
import { React } from "react";

import "../../../node_modules/react-vis/dist/style.css";
import {
  XYPlot,
  VerticalBarSeries,
  VerticalBarSeriesCanvas,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
} from "react-vis";

const BarChart = () => {
  const myDATA = [
    { id: "00036", y: 200400, x: 1504121437 },
    { id: "00036", y: 200350, x: 1504121156 },
    { id: "00036", y: 200310, x: 1504120874 },
    { id: "00036", y: 200260, x: 1504120590 },
    { id: "00036", y: 200210, x: 1504120306 },
    { id: "00036", y: 200160, x: 1504120024 },
    { id: "00036", y: 200120, x: 1504119740 },
    { id: "00036", y: 200070, x: 1504119458 },
    { id: "00036", y: 200020, x: 1504119177 },
    { id: "00036", y: 199980, x: 1504118893 },
    { id: "00036", y: 199930, x: 1504118611 },
    { id: "00036", y: 199880, x: 1504118330 },
    { id: "00036", y: 199830, x: 1504118048 },
    { id: "00036", y: 199790, x: 1504117763 },
    { id: "00036", y: 199740, x: 1504117481 },
  ];

  const yDomain = myDATA.reduce(
    (res, row) => {
      return {
        max: Math.max(res.max, row.y),
        min: Math.min(res.min, row.y),
      };
    },
    { max: -Infinity, min: Infinity }
  );

  return (
    <XYPlot
      margin={{ left: 75 }}
      xType="time"
      width={300}
      height={300}
      yDomain={[yDomain.min, yDomain.max]}
    >
      <VerticalBarSeries
        className="vertical-bar-series-example"
        data={myDATA}
      />
      <XAxis />
      <YAxis />
    </XYPlot>
  );
};

export default BarChart;
=======
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const BarChartComponent = () => (
  <BarChart
    width={500}
    height={300}
    data={data}
    margin={{
      top: 5, right: 30, left: 20, bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="pv" fill="#8884d8" />
    <Bar dataKey="uv" fill="#82ca9d" />
  </BarChart>
);

export default BarChartComponent;
>>>>>>> main
