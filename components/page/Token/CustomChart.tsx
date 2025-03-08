"use client";

import GlobalContext from "@/context/store";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramData,
  MouseEventParams,
  ChartOptions,
  DeepPartial,
  Time,
  SeriesMarkerPosition,
  SeriesMarkerShape,
} from "lightweight-charts";
import React, { useContext, useEffect, useRef, useCallback } from "react";
import { isTokenInfo } from "@/types/helper";

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
      WHITE: "rgb(255, 255, 255)",
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
    background: { color: "transparent" },
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
const {
  candlestickData: defaultCandlestickData,
  volumeData: defaultVolumeData,
} = generateData(new Date(2023, 0, 1), 100);

// Props interface
interface ChartProps {
  initialCandlestickData?: ChartData[];
  initialVolumeData?: HistogramData[];
  isLive?: boolean;
}

export default function Chart({
  initialCandlestickData = defaultCandlestickData,
  initialVolumeData = defaultVolumeData,
  isLive = false,
}: ChartProps): JSX.Element {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const symbolLabelRef = useRef<HTMLDivElement | null>(null);
  const { selectedToken } = useContext(GlobalContext);

  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      const newWidth = chartContainerRef.current.clientWidth;
      const newHeight = chartContainerRef.current.clientHeight;

      chartRef.current.resize(newWidth, newHeight);

      chartRef.current.timeScale().applyOptions({
        rightOffset: 12,
        barSpacing: 60,
      });
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  // Effect for handling resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Effect for updating data when initialCandlestickData or initialVolumeData change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    if (initialCandlestickData && initialCandlestickData.length > 0) {
      candlestickSeriesRef.current.setData(initialCandlestickData);
    }

    if (initialVolumeData && initialVolumeData.length > 0) {
      volumeSeriesRef.current.setData(initialVolumeData);
    }

    // Fit content to show all data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [initialCandlestickData, initialVolumeData]);

  // Main effect for chart initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    // Create and position symbol label
    const symbolLabel = document.createElement("div");
    symbolLabel.style.position = "absolute";
    symbolLabel.style.top = "-10px";
    symbolLabel.style.left = "10px";
    symbolLabel.style.zIndex = "10";
    symbolLabel.style.color = TOOLTIP_CONFIG.COLORS.TEXT.WHITE;
    symbolLabel.style.fontSize = "16px";
    symbolLabel.style.fontWeight = "bold";
    symbolLabel.textContent =
      selectedToken && isTokenInfo(selectedToken)
        ? selectedToken.tickerSymbol
        : selectedToken && selectedToken.symbol;
    symbolLabelRef.current = symbolLabel;
    chartContainerRef.current.appendChild(symbolLabel);

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

    // Set initial candlestick data
    candlestickSeriesRef.current.setData(initialCandlestickData);

    // Add live indicator if applicable
    if (isLive) {
      const liveIndicator = document.createElement("div");
      liveIndicator.style.position = "absolute";
      liveIndicator.style.top = "-10px";
      liveIndicator.style.right = "10px";
      liveIndicator.style.zIndex = "10";
      liveIndicator.style.color = TOOLTIP_CONFIG.COLORS.GREEN;
      liveIndicator.style.fontSize = "14px";
      liveIndicator.style.fontWeight = "bold";
      liveIndicator.style.display = "flex";
      liveIndicator.style.alignItems = "center";
      liveIndicator.style.gap = "5px";

      // Add pulse animation for live indicator
      const pulseDiv = document.createElement("div");
      pulseDiv.style.width = "8px";
      pulseDiv.style.height = "8px";
      pulseDiv.style.borderRadius = "50%";
      pulseDiv.style.backgroundColor = TOOLTIP_CONFIG.COLORS.GREEN;
      pulseDiv.style.animation = "pulse 1.5s infinite";

      // Add animation keyframes
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      liveIndicator.appendChild(pulseDiv);
      liveIndicator.appendChild(document.createTextNode("LIVE"));

      chartContainerRef.current.appendChild(liveIndicator);
    }

    // determining the dates for the 'buy' and 'sell' markers added below.
    const datesForMarkers = [
      defaultCandlestickData[defaultCandlestickData.length - 39],
      defaultCandlestickData[defaultCandlestickData.length - 19],
    ];
    let indexOfMinPrice = 0;
    for (let i = 1; i < datesForMarkers.length; i++) {
      if (datesForMarkers[i].high < datesForMarkers[indexOfMinPrice].high) {
        indexOfMinPrice = i;
      }
    }
    const markers = [
      {
        time: defaultCandlestickData[defaultCandlestickData.length - 48].time,
        position: "aboveBar" as SeriesMarkerPosition,
        color: "#f68410",
        shape: "circle" as SeriesMarkerShape,
        text: "D",
      },
    ];
    for (let i = 0; i < datesForMarkers.length; i++) {
      if (i !== indexOfMinPrice) {
        markers.push({
          time: datesForMarkers[i].time,
          position: "aboveBar" as SeriesMarkerPosition,
          color: "rgb(239, 83, 80)",
          shape: "arrowDown" as SeriesMarkerShape,
          text: "Sell",
        });
      } else {
        markers.push({
          time: datesForMarkers[i].time,
          position: "belowBar" as SeriesMarkerPosition,
          color: "rgb(38, 166, 154)",
          shape: "arrowUp" as SeriesMarkerShape,
          text: "Buy",
        });
      }
    }
    candlestickSeriesRef.current.setMarkers(markers);

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

    // Set initial volume data
    volumeSeriesRef.current.setData(initialVolumeData);
    chartRef.current.timeScale().fitContent();

    // Create tooltip
    tooltipRef.current = createTooltip();
    chartContainerRef.current.appendChild(tooltipRef.current);

    // Event handlers
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

      const trendColor =
        candlestickData.open > candlestickData.close
          ? TOOLTIP_CONFIG.COLORS.RED
          : TOOLTIP_CONFIG.COLORS.GREEN;

      tooltipRef.current.style.display = "flex";
      tooltipRef.current.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 20px;">
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.WHITE}">O</span>
          <span style="color: ${trendColor}">${formatNumber(
        candlestickData.open
      )}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.WHITE}">H</span>
          <span style="color: ${trendColor}">${formatNumber(
        candlestickData.high
      )}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.WHITE}">L</span>
          <span style="color: ${trendColor}">${formatNumber(
        candlestickData.low
      )}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.WHITE}">C</span>
          <span style="color: ${trendColor}">${formatNumber(
        candlestickData.close
      )}</span>
          <span style="color: ${TOOLTIP_CONFIG.COLORS.TEXT.WHITE}">Volume</span>
          <span style="color: ${trendColor}">${formatVolume(
        volumeData?.value ?? 0
      )}</span>
        </div>
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
  }, [selectedToken, handleResize, isLive]);

  return (
    <div className="w-full h-[500px] p-4 rounded-lg shadow-md">
      <div ref={chartContainerRef} className="w-full h-full relative" />
    </div>
  );
}
