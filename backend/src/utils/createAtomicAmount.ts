import { processPriceToAtomicAmount } from "x402/shared";
import type { Price, Network } from "x402/types";

export function createAtomicAmount(price: Price, network: Network) {
  if (network === "base-sepolia") {
    return {
      //@ts-ignore
      maxAmountRequired: Math.floor(price.amount * 10 ** 6),
      asset: {
        address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        eip712: { name: "USD Coin", version: "2" },
      },
      assetSymbol: "USDC",
    };
  }

  return processPriceToAtomicAmount(price, network);
}
