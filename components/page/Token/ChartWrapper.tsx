"use client";

import { useEffect, useState, useContext } from "react";
import { useWebSocket } from "@/hooks/useWebsocket";
import Chart from "./CustomChart";
import GlobalContext from "@/context/store";
import { HistogramData, Time } from "lightweight-charts";
import { isTokenInfo } from "@/types/helper";

// Define the structure of incoming WebSocket messages
interface WebSocketMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  c: string; // Last price
  w: string; // Weighted average price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number;
  color?: string;
}

export default function ChartWrapper() {
  const { selectedToken } = useContext(GlobalContext);
  const [candlestickData, setCandlestickData] = useState<ChartData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);

  // Construct WebSocket URL based on selected token
  const wsUrl = "wss://stream.binance.com:9443/ws/btcusdt@miniTicker";

  // Initialize WebSocket connection
  const { isConnected, isReconnecting, sendMessage } = useWebSocket(wsUrl, {
    onOpen: (event) => {
      console.log(
        `Connected to ${
          selectedToken && isTokenInfo(selectedToken)
            ? selectedToken.tickerSymbol
            : selectedToken?.symbol || ""
        } market data stream`
      );
      // Subscribe to market data for the selected token
      sendMessage(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: ["btcusdt@miniTicker"],
          id: 1,
        })
      );
    },
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message) {
          const { E, o, h, l, c, v } = message;
          console.log("Data: ", message);

          const formattedDate = formatDateFromUnixTimestamp(E);

          // Add new candlestick data
          const newCandlestick = {
            time: formattedDate as Time,
            open: +o,
            high: +h,
            low: +l,
            close: +c,
          };

          // Add new volume data
          const newVolume = {
            time: formattedDate as Time,
            value: +v,
            color:
              +c > +o ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)",
          };

          // Update state with new data
          setCandlestickData((prev) => {
            // Check if we already have data for this timestamp
            const existingIndex = prev.findIndex(
              (item) => item.time === formattedDate
            );
            if (existingIndex >= 0) {
              // Update existing data point instead of adding a new one
              const updated = [...prev];
              updated[existingIndex] = newCandlestick;
              return updated;
            }
            // Otherwise add new data point
            return [...prev, newCandlestick].sort((a, b) => {
              // Ensure chronological order
              if (typeof a.time === "string" && typeof b.time === "string") {
                return new Date(a.time).getTime() - new Date(b.time).getTime();
              }
              return 0;
            });
          });

          setVolumeData((prev) => {
            // Check if we already have data for this timestamp
            const existingIndex = prev.findIndex(
              (item) => item.time === formattedDate
            );
            if (existingIndex >= 0) {
              // Update existing data point instead of adding a new one
              const updated = [...prev];
              updated[existingIndex] = newVolume;
              return updated;
            }
            // Otherwise add new data point
            return [...prev, newVolume].sort((a, b) => {
              // Ensure chronological order
              if (typeof a.time === "string" && typeof b.time === "string") {
                return new Date(a.time).getTime() - new Date(b.time).getTime();
              }
              return 0;
            });
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    onClose: () => {
      console.log("WebSocket connection closed");
    },
  });

  // Load initial historical data
  useEffect(() => {
    if (!selectedToken) return;

    // Reset data when token changes
    setCandlestickData([]);
    setVolumeData([]);

    // Fetch historical data from API
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `/api/historical-data/${
            isTokenInfo(selectedToken)
              ? selectedToken.tickerSymbol
              : selectedToken.symbol
          }`
        );

        if (response.ok) {
          const data = await response.json();

          // Process historical candlestick data
          const historicalCandlesticks = data.candlesticks.map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));

          // Process historical volume data
          const historicalVolumes = data.volumes.map((item: any) => ({
            time: item.time,
            value: item.volume,
            color:
              item.close > item.open
                ? "rgba(38, 166, 154, 0.3)"
                : "rgba(239, 83, 80, 0.3)",
          }));

          setCandlestickData(historicalCandlesticks);
          setVolumeData(historicalVolumes);
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [selectedToken]);

  // Custom Chart props to accept real-time data
  const chartProps = {
    initialCandlestickData: candlestickData,
    initialVolumeData: volumeData,
    isLive: isConnected,
  };

  return (
    <div className="relative w-full">
      {isReconnecting && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl text-sm">
          Reconnecting...
        </div>
      )}

      {!isConnected && !isReconnecting && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl text-sm">
          Disconnected
        </div>
      )}

      <Chart {...chartProps} />
    </div>
  );
}

function formatDateFromUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const time = date.toISOString().split("T")[0];

  return time;
}
