export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(2).toString();
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface PriceFormatterOptions {
  minSignificantDigits?: number;
  maxSignificantDigits?: number;
  currency?: string;
  showCurrencySymbol?: boolean;
}

const formatTokenPrice = (
  price: number,
  options: PriceFormatterOptions = {}
): string => {
  const {
    minSignificantDigits = 2,
    maxSignificantDigits = 6,
    currency = "USD",
    showCurrencySymbol = true,
  } = options;

  // Handle invalid input
  if (typeof price !== "number" || isNaN(price) || !isFinite(price)) {
    return "N/A";
  }

  // For very small numbers, use scientific notation
  if (price < 1e-10) {
    return `${showCurrencySymbol ? "$" : ""}${price.toExponential(
      maxSignificantDigits
    )}`;
  }

  // For small numbers but not tiny (show leading zeros)
  if (price < 0.000001) {
    const zeros = -Math.floor(Math.log10(price)) - 1;
    const significantDigits = price.toFixed(zeros + maxSignificantDigits);
    return `${showCurrencySymbol ? "$" : ""}${significantDigits}`;
  }

  // For regular numbers
  const formatter = new Intl.NumberFormat("en-US", {
    style: showCurrencySymbol ? "currency" : "decimal",
    currency: currency,
    minimumSignificantDigits: minSignificantDigits,
    maximumSignificantDigits: maxSignificantDigits,
  });

  return formatter.format(price);
};

// Export type and function
export type { PriceFormatterOptions };
export { formatTokenPrice };
