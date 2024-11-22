/* eslint-disable */
"use client";

import {
  createChart,
  IChartApi,
  CandlestickData,
  HistogramData,
  MouseEventParams,
} from "lightweight-charts";
import React, { useEffect, useRef } from "react";

const chartOptions = {
  layout: {
    textColor: "black",
    background: { color: "white" },
  },
  grid: {
    vertLines: { color: "rgba(197, 203, 206, 0.5)" },
    horzLines: { color: "rgba(197, 203, 206, 0.5)" },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      width: 1,
      color: "rgba(224, 227, 235, 0.1)",
      style: 0,
    },
    horzLine: {
      width: 1,
      color: "rgba(224, 227, 235, 0.1)",
      style: 0,
    },
  },
};

const generateData = (
  startDate: Date,
  count: number
): { candlestickData: CandlestickData[]; volumeData: HistogramData[] } => {
  const candlestickData: CandlestickData[] = [];
  const volumeData: HistogramData[] = [];
  let currentDate = startDate;
  let lastClose = 100;

  for (let i = 0; i < count; i++) {
    const time = currentDate.toISOString().split("T")[0];

    const open = lastClose + (Math.random() - 0.5) * 5;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = low + Math.random() * (high - low);

    candlestickData.push({ time, open, high, low, close });

    const volume = Math.floor(Math.random() * 1000000) + 100000;
    const color =
      close > open ? "rgba(0, 150, 136, 0.8)" : "rgba(255, 82, 82, 0.8)";
    volumeData.push({ time, value: volume, color });

    lastClose = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { candlestickData, volumeData };
};

const { candlestickData, volumeData } = generateData(new Date(2023, 0, 1), 100);

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candlestickChartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const container = chartContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Create candlestick chart
      candlestickChartRef.current = createChart(container, {
        ...chartOptions,
        width: containerWidth,
        height: containerHeight * 0.7,
      });

      const candlestickSeries =
        candlestickChartRef.current.addCandlestickSeries({
          upColor: "#26a69a",
          downColor: "#ef5350",
          borderVisible: false,
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
        });
      candlestickSeries.setData(candlestickData);

      // Create volume chart
      volumeChartRef.current = createChart(container, {
        ...chartOptions,
        width: containerWidth,
        height: containerHeight * 0.3,
        priceScale: {
          position: "right",
        },
      });

      const volumeSeries = volumeChartRef.current.addHistogramSeries({
        color: "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });
      volumeSeries.setData(volumeData);

      // Sync the time scales
      const syncTimeScales = () => {
        if (candlestickChartRef.current && volumeChartRef.current) {
          const candlestickTimeScale = candlestickChartRef.current.timeScale();
          const volumeTimeScale = volumeChartRef.current.timeScale();

          const syncCharts = (
            sourceChart: IChartApi,
            targetChart: IChartApi
          ) => {
            const visibleRange = sourceChart.timeScale().getVisibleRange();
            if (visibleRange) {
              targetChart.timeScale().setVisibleRange(visibleRange);
            }
          };

          candlestickTimeScale.subscribeVisibleTimeRangeChange(() => {
            syncCharts(candlestickChartRef.current!, volumeChartRef.current!);
          });

          volumeTimeScale.subscribeVisibleTimeRangeChange(() => {
            syncCharts(volumeChartRef.current!, candlestickChartRef.current!);
          });
        }
      };

      syncTimeScales();

      // Sync mouse wheel events
      const handleWheel = (event: WheelEvent) => {
        if (candlestickChartRef.current && volumeChartRef.current) {
          event.preventDefault();
          const delta = event.deltaY;

          const candlestickTimeScale = candlestickChartRef.current.timeScale();
          const volumeTimeScale = volumeChartRef.current.timeScale();

          const candlestickLogicalRange =
            candlestickTimeScale.getVisibleLogicalRange();
          if (candlestickLogicalRange) {
            const newRange = {
              from: candlestickLogicalRange.from + delta * 0.1,
              to: candlestickLogicalRange.to - delta * 0.1,
            };
            candlestickTimeScale.setVisibleLogicalRange(newRange);
            volumeTimeScale.setVisibleLogicalRange(newRange);
          }
        }
      };

      container.addEventListener("wheel", handleWheel);

      // Fit content
      candlestickChartRef.current.timeScale().fitContent();
      volumeChartRef.current.timeScale().fitContent();

      const handleResize = () => {
        if (
          candlestickChartRef.current &&
          volumeChartRef.current &&
          container
        ) {
          const newWidth = container.clientWidth;
          const newHeight = container.clientHeight;
          candlestickChartRef.current.applyOptions({
            width: newWidth,
            height: newHeight * 0.7,
          });
          volumeChartRef.current.applyOptions({
            width: newWidth,
            height: newHeight * 0.3,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        container.removeEventListener("wheel", handleWheel);
        if (candlestickChartRef.current) candlestickChartRef.current.remove();
        if (volumeChartRef.current) volumeChartRef.current.remove();
      };
    }
  }, []);

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-lg shadow-md">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        aria-label="Trading chart with candlestick price data and volume information"
      />
    </div>
  );
}
