import { Button } from "@/components/ui/button";

type ItemProps = {
  info: {
    name: string;
    ticker: string;
    icon: string;
    price: string;
    marketCap: string;
    change: string;
    timeFrame: string;
    transactions: number;
    volume: string;
  };
};

const Item: React.FC<ItemProps> = ({ info }) => {
  return (
    <div
      key={info.name}
      className="flex items-center justify-between border-b border-gray-700 pb-2"
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <h3 className="font-semibold">{info.name}</h3>
          {/* <p className="text-sm text-gray-400">{info.ticker}</p> */}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{info.price}</p>
        <p className="text-sm text-gray-400">MC: {info.marketCap}</p>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            info.change.startsWith("-") ? "text-red-500" : "text-green-500"
          }`}
        >
          {info.change}
        </p>
        {/* <p className="text-sm text-gray-400">{info.timeFrame}</p> */}
      </div>
      <Button variant="outline" size="sm">
        Buy
      </Button>
    </div>
  );
};

export default Item;
