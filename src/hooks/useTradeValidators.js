import { useMemo } from "react";
import {
	validateBuyHelper,
	validateSellHelper,
	validateCrowdsaleHelper,
} from "../utils/checkout-utils";

export function useTradeValidators({
	allowanceSelectedToken,
	allowanceWINES,
	balanceETH,
	balanceWINES,
	balanceSelectedToken,
	reserveWINESETH,
	reserveWINESToken,
	reserveSelectedTokenETH,
	reserveSelectedTokenToken,
	selectedTokenSymbol,
	crowdsaleExchangeRateETH,
	usdExchangeRateETH,
}) {
	return useMemo(() => {
		return {
			validateBuy: (numberOfWINES) =>
				validateBuyHelper(
					numberOfWINES,
					allowanceSelectedToken,
					balanceETH,
					balanceSelectedToken,
					reserveWINESETH,
					reserveWINESToken,
					reserveSelectedTokenETH,
					reserveSelectedTokenToken,
					selectedTokenSymbol
				),
			validateSell: (numberOfWINES) =>
				validateSellHelper(
					numberOfWINES,
					allowanceWINES,
					balanceETH,
					balanceWINES,
					reserveWINESETH,
					reserveWINESToken,
					reserveSelectedTokenETH,
					reserveSelectedTokenToken,
					selectedTokenSymbol
				),
			validateCrowdsale: (numberOfWINES) =>
				validateCrowdsaleHelper(
					numberOfWINES,
					allowanceSelectedToken,
					balanceETH,
					balanceSelectedToken,
					crowdsaleExchangeRateETH,
					selectedTokenSymbol,
					usdExchangeRateETH
				),
		};
	}, [
		allowanceSelectedToken,
		allowanceWINES,
		balanceETH,
		balanceWINES,
		balanceSelectedToken,
		reserveWINESETH,
		reserveWINESToken,
		reserveSelectedTokenETH,
		reserveSelectedTokenToken,
		selectedTokenSymbol,
		crowdsaleExchangeRateETH,
		usdExchangeRateETH,
	]);
}

export default useTradeValidators;
