import { ethers, BigNumber } from "ethers";
import axios from "axios";

import {
  TOKEN_SYMBOLS,
  ERROR_CODES,
  calculateSlippageBounds,
  calculateAmount,
  calculateCrowdsaleAmount,
  generateRandom,
} from "../utils";
import { APIURL } from "../config";
import { dollarize } from "../features/trading/lib/formatters";

export function validateBuyHelper(
  numberOfWINES,
  allowanceSelectedToken,
  balanceETH,
  balanceSelectedToken,
  reserveWINESETH,
  reserveWINESToken,
  reserveSelectedTokenETH,
  reserveSelectedTokenToken,
  selectedTokenSymbol
) {
  // validate passed amount
  let parsedValue;
  try {
    parsedValue = ethers.utils.parseUnits(numberOfWINES, 18);
  } catch (error) {
    error.code = ERROR_CODES.INVALID_AMOUNT;
    throw error;
  }

  let requiredValueInSelectedToken;
  try {
    requiredValueInSelectedToken = calculateAmount(
      selectedTokenSymbol,
      TOKEN_SYMBOLS.MTB,
      parsedValue,
      reserveWINESETH,
      reserveWINESToken,
      reserveSelectedTokenETH,
      reserveSelectedTokenToken
    );
  } catch (error) {
    error.code = ERROR_CODES.INVALID_TRADE;
    throw error;
  }

  // get max slippage amount
  const { maximum } = calculateSlippageBounds(requiredValueInSelectedToken);

  // the following are 'non-breaking' errors that will still return the data
  let errorAccumulator;
  // validate minimum ether balance

  if (balanceETH && balanceETH.lt(ethers.utils.parseEther(".001"))) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_ETH_GAS;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate minimum selected token balance
  if (balanceSelectedToken && maximum && balanceSelectedToken.lt(maximum)) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_SELECTED_TOKEN_BALANCE;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate allowance
  if (selectedTokenSymbol !== "ETH") {
    if (
      allowanceSelectedToken &&
      maximum &&
      allowanceSelectedToken.lt(maximum)
    ) {
      const error = Error();
      error.code = ERROR_CODES.INSUFFICIENT_ALLOWANCE;
      if (!errorAccumulator) {
        errorAccumulator = error;
      }
    }
  }

  return {
    inputValue: requiredValueInSelectedToken,
    maximumInputValue: maximum,
    outputValue: parsedValue,
    error: errorAccumulator,
  };
}

export function validateCrowdsaleHelper(
  numberOfWINES,
  allowanceSelectedToken,
  balanceETH,
  balanceSelectedToken,
  crowdsaleExchangeRateETH,
  selectedTokenSymbol
) {
  // validate passed amount
  let parsedValue;
  try {
    parsedValue = ethers.utils.parseUnits(numberOfWINES, 18);
  } catch (error) {
    error.code = ERROR_CODES.INVALID_AMOUNT;
    throw error;
  }

  let requiredValueInSelectedToken;
  try {
    requiredValueInSelectedToken = calculateCrowdsaleAmount(
      parsedValue,
      crowdsaleExchangeRateETH
    );

    console.log(requiredValueInSelectedToken.toString(), "eskere");
  } catch (error) {
    error.code = ERROR_CODES.INVALID_TRADE;
    throw error;
  }

  // get max slippage amount
  const { maximum } = calculateSlippageBounds(requiredValueInSelectedToken);

  // the following are 'non-breaking' errors that will still return the data
  let errorAccumulator;
  // validate minimum ether balance
  if (balanceETH && balanceETH.lt(ethers.utils.parseEther(".001"))) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_ETH_GAS;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate minimum selected token balance
  if (balanceSelectedToken && maximum && balanceSelectedToken.lt(maximum)) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_SELECTED_TOKEN_BALANCE;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate allowance
  if (selectedTokenSymbol !== "ETH") {
    if (
      allowanceSelectedToken &&
      maximum &&
      allowanceSelectedToken.lt(maximum)
    ) {
      const error = Error();
      error.code = ERROR_CODES.INSUFFICIENT_ALLOWANCE;
      if (!errorAccumulator) {
        errorAccumulator = error;
      }
    }
  }

  return {
    inputValue: requiredValueInSelectedToken,
    maximumInputValue: requiredValueInSelectedToken,
    outputValue: parsedValue,
    error: errorAccumulator,
  };
}

export async function saveOrder(
  amount,
  account,
  email,
  winerie_id,
  name,
  token
) {
  const body = {
    public_key: account,
    email: email,
    amount: amount,
    winerie_id: winerie_id,
    name: name,
    token: token,
    id: generateRandom(),
  };

  const url = APIURL;

  return await axios.post(`${url}/sales`, body);
}

export function validateSellHelper(
  numberOfWINES,
  allowanceWINES,
  balanceETH,
  balanceWINES,
  reserveWINESETH,
  reserveWINESToken,
  reserveSelectedTokenETH,
  reserveSelectedTokenToken,
  selectedTokenSymbol
) {
  console.log({
    numberOfWINES,
    allowanceWINES,
    balanceETH,
    balanceWINES,
    reserveWINESETH,
    reserveWINESToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
    selectedTokenSymbol,
  });

  // validate passed amount
  let parsedValue;
  try {
    parsedValue = ethers.utils.parseUnits(numberOfWINES, 18);
  } catch (error) {
    error.code = ERROR_CODES.INVALID_AMOUNT;
    throw error;
  }

  // how much ETH or tokens the sale will result in
  let requiredValueInSelectedToken;
  try {
    requiredValueInSelectedToken = calculateAmount(
      TOKEN_SYMBOLS.MTB,
      selectedTokenSymbol,
      parsedValue,
      reserveWINESETH,
      reserveWINESToken,
      reserveSelectedTokenETH,
      reserveSelectedTokenToken
    );
  } catch (error) {
    error.code = ERROR_CODES.INVALID_EXCHANGE;
    throw error;
  }

  // slippage-ized
  const { minimum } = calculateSlippageBounds(requiredValueInSelectedToken);

  // the following are 'non-breaking' errors that will still return the data
  let errorAccumulator;
  // validate minimum ether balance
  if (balanceETH.lt(ethers.utils.parseEther(".001"))) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_ETH_GAS;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate minimum wine balance
  if (balanceWINES.lt(parsedValue)) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_SELECTED_TOKEN_BALANCE;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  // validate allowance
  if (allowanceWINES.lt(parsedValue)) {
    const error = Error();
    error.code = ERROR_CODES.INSUFFICIENT_ALLOWANCE;
    if (!errorAccumulator) {
      errorAccumulator = error;
    }
  }

  return {
    inputValue: parsedValue,
    outputValue: requiredValueInSelectedToken,
    minimumOutputValue: minimum,
    error: errorAccumulator,
  };
}

export { dollarize as _dollarize };
