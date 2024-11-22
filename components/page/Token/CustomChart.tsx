/* eslint-disable */
"use client";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramData,
  MouseEventParams,
  ChartOptions,
  DeepPartial,
  Time,
} from "lightweight-charts";
import React, { useEffect, useRef } from "react";

// Constants
const TOOLTIP_CONFIG = {
  HEIGHT: 22, // Reduced height for single line
  PADDING: 8,
  COLORS: {
    PRIMARY: "#131722",
    TEXT: {
      LABEL: "#787B86",
      VALUE: "#D1D4DC",
      GREEN: "rgb(38, 166, 154)",
      RED: "rgb(239, 83, 80)",
    },
    UP: "rgba(38, 166, 154, 0.3)",
    DOWN: "rgba(239, 83, 80, 0.3)",
    GREEN: "rgb(38, 166, 154)",
    RED: "rgb(239, 83, 80)",
  },
} as const;

// Types
interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number;
  color?: string;
}

// Chart configuration
const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    textColor: "white",
    background: { color: "#34333D" },
  },
  grid: {
    vertLines: {
      color: "rgba(197, 203, 206, 0.1)",
    },
    horzLines: {
      color: "rgba(197, 203, 206, 0.1)",
    },
  },
};

// Helper functions
const generateData = (
  startDate: Date,
  count: number
): { candlestickData: ChartData[]; volumeData: HistogramData[] } => {
  const candlestickData: ChartData[] = [];
  const volumeData: HistogramData[] = [];
  let currentDate = new Date(startDate);
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
      close > open ? TOOLTIP_CONFIG.COLORS.UP : TOOLTIP_CONFIG.COLORS.DOWN;
    volumeData.push({ time, value: volume, color });

    lastClose = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { candlestickData, volumeData };
};

const formatNumber = (num: number): string => {
  return num.toFixed(7);
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toString();
};

const createTooltip = (): HTMLDivElement => {
  const tooltip = document.createElement("div");

  const baseStyles: Partial<CSSStyleDeclaration> = {
    height: `${TOOLTIP_CONFIG.HEIGHT}px`,
    position: "absolute",
    padding: `0 ${TOOLTIP_CONFIG.PADDING}px`,
    boxSizing: "border-box",
    fontSize: "12px",
    textAlign: "left",
    zIndex: "1000",
    top: "0",
    left: "0",
    right: "0",
    pointerEvents: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "transparent",
    color: TOOLTIP_CONFIG.COLORS.TEXT.VALUE,
    borderBottom: "1px solid rgba(42, 46, 57, 0.5)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  Object.assign(tooltip.style, baseStyles);
  return tooltip;
};

// Generate initial data
const { candlestickData: candlestickSeriesData, volumeData: volumeSeriesData } =
  generateData(new Date(2023, 0, 1), 100);

export default function Chart(): JSX.Element {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    // Setup candlestick series
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: TOOLTIP_CONFIG.COLORS.GREEN,
      downColor: TOOLTIP_CONFIG.COLORS.RED,
      borderVisible: false,
      wickUpColor: TOOLTIP_CONFIG.COLORS.GREEN,
      wickDownColor: TOOLTIP_CONFIG.COLORS.RED,
    });

    candlestickSeriesRef.current.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    });

    candlestickSeriesRef.current.setData(candlestickSeriesData);

    // Setup volume series
    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: TOOLTIP_CONFIG.COLORS.UP,
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeriesRef.current.priceScale().applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
    });

    volumeSeriesRef.current.setData(volumeSeriesData);
    chartRef.current.timeScale().fitContent();

    // Create tooltip
    tooltipRef.current = createTooltip();
    chartContainerRef.current.appendChild(tooltipRef.current);

    // Event handlers
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const handleCrosshairMove = (param: MouseEventParams) => {
      if (
        !tooltipRef.current ||
        !candlestickSeriesRef.current ||
        !volumeSeriesRef.current
      )
        return;

      if (!param.time) {
        tooltipRef.current.style.display = "none";
        return;
      }

      const candlestickData = param.seriesData.get(
        candlestickSeriesRef.current
      ) as ChartData;
      const volumeData = param.seriesData.get(
        volumeSeriesRef.current
      ) as HistogramData;

      if (!candlestickData) return;

      tooltipRef.current.style.display = "flex";
      tooltipRef.current.innerHTML = `
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.LABEL}">O</span>
          <span>${formatNumber(candlestickData.open)}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.LABEL}">H</span>
          <span>${formatNumber(candlestickData.high)}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.LABEL}">L</span>
          <span>${formatNumber(candlestickData.low)}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.LABEL}">C</span>
          <span>${formatNumber(candlestickData.close)}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.LABEL}">Volume</span>
          <span>${formatVolume(volumeData?.value ?? 0)}</span>
        `;
    };

    window.addEventListener("resize", handleResize);
    chartRef.current.subscribeCrosshairMove(handleCrosshairMove);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.unsubscribeCrosshairMove(handleCrosshairMove);
        chartRef.current.remove();
      }
      tooltipRef.current?.remove();
    };
  }, []);

  return (
    <div className="w-full h-[500px] p-4 rounded-lg shadow-md">
      <div ref={chartContainerRef} className="w-full h-full relative" />
    </div>
  );
}
