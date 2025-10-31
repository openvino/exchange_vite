import { base, baseSepolia } from "thirdweb/chains";
import { DEV_MODE } from "../config";


export const getChain = () => {
  const productionMode = DEV_MODE === "production";
  if (productionMode) {
    return base;
  } else {
    return baseSepolia;
  }
};
