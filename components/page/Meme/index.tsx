import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import Panel from "./Panel";
import List, { renderList } from "../List";
import Item from "./Item";

const cryptoData = [
  {
    name: "MASON AI",
    ticker: "MASONS AI",
    icon: "🧠",
    price: "$3.42",
    marketCap: "$7.1K",
    change: "0%",
    timeFrame: "5s",
    transactions: 3,
    volume: "$509.6",
  },
  {
    name: "FML",
    ticker: "Fucking more Ls",
    icon: "💀",
    price: "$3.42",
    marketCap: "$8.2K",
    change: "5.1%",
    timeFrame: "13s",
    transactions: 16,
    volume: "$2.5K",
  },
  {
    name: "Tester",
    ticker: "Tron Mascot",
    icon: "🎈",
    price: "$3.41",
    marketCap: "$6.8K",
    change: "3.5%",
    timeFrame: "19s",
    transactions: 3,
    volume: "$788.4",
  },
  {
    name: "MASON AI",
    ticker: "MASONS AI",
    icon: "🧠",
    price: "$3.42",
    marketCap: "$7.1K",
    change: "0%",
    timeFrame: "5s",
    transactions: 3,
    volume: "$509.6",
  },
  {
    name: "FML",
    ticker: "Fucking more Ls",
    icon: "💀",
    price: "$3.42",
    marketCap: "$8.2K",
    change: "5.1%",
    timeFrame: "13s",
    transactions: 16,
    volume: "$2.5K",
  },
  {
    name: "Tester",
    ticker: "Tron Mascot",
    icon: "🎈",
    price: "$3.41",
    marketCap: "$6.8K",
    change: "3.5%",
    timeFrame: "19s",
    transactions: 3,
    volume: "$788.4",
  },
  {
    name: "MASON AI",
    ticker: "MASONS AI",
    icon: "🧠",
    price: "$3.42",
    marketCap: "$7.1K",
    change: "0%",
    timeFrame: "5s",
    transactions: 3,
    volume: "$509.6",
  },
  {
    name: "FML",
    ticker: "Fucking more Ls",
    icon: "💀",
    price: "$3.42",
    marketCap: "$8.2K",
    change: "5.1%",
    timeFrame: "13s",
    transactions: 16,
    volume: "$2.5K",
  },
  {
    name: "Tester",
    ticker: "Tron Mascot",
    icon: "🎈",
    price: "$3.41",
    marketCap: "$6.8K",
    change: "3.5%",
    timeFrame: "19s",
    transactions: 3,
    volume: "$788.4",
  },
];

export default function Page() {
  return (
    <div className="grow p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-3 md:col-span-2 lg:col-span-1 hidden lg:block">
          <Panel title={"New Pool"} height="h-[445px]">
            <List list={renderList(cryptoData, Item)} />
          </Panel>
        </div>
        <Panel title={"Burnt"} height={"445px"} />

        <Panel title={"DEXScreener Spent"} height={"445px"} />
      </div>
    </div>
  );
}
