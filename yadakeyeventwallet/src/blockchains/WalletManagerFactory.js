import YadaBSC from "./YadaBSC";
import YadaCoin from "./YadaCoin";
import Salvium from "./Salvium";

export const walletManagerFactory = (blockchainId) => {
  switch (blockchainId) {
    case "bsc":
      return new YadaBSC();
    case "eth":
      // return new YadaETH(appContext);
      throw new Error("Ethereum WalletManager not yet implemented");
    case "yda":
      return new YadaCoin();
    case "btc":
      return new YadaCoin();
    case "sal":
      return new Salvium();
    default:
      throw new Error(`Unsupported blockchain: ${blockchainId}`);
  }
};
