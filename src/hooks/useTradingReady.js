import { useMemo } from "react";
import { TOKEN_SYMBOLS } from "../utils";


export function useTradingReady({
	isCrowdsale,
	tokenSupply,
	accountAddress,
	allowanceWINES,
	allowanceSelectedToken,
	balanceETH,
	balanceWINES,
	balanceSelectedToken,
	reserveWINESETH,
	reserveWINESToken,
	reserveSelectedTokenETH,
	reserveSelectedTokenToken,
	selectedTokenSymbol,
	usdExchangeRateETH,
	usdExchangeRateSelectedToken,
}) {
	return useMemo(() => {
		if (isCrowdsale) {
			return typeof tokenSupply === "number" ? tokenSupply > 6 : false;
		}

		const normalizedAddress = accountAddress ?? null;
		const walletDisconnected = normalizedAddress === null;

		if (!reserveWINESETH || !reserveWINESToken) {
			return false;
		}

		if (
			selectedTokenSymbol !== TOKEN_SYMBOLS.ETH &&
			(!reserveSelectedTokenETH || !reserveSelectedTokenToken)
		) {
			return false;
		}

		if (!selectedTokenSymbol) {
			return false;
		}

		if (!usdExchangeRateETH && !usdExchangeRateSelectedToken) {
			return false;
		}

		if (!walletDisconnected) {
			if (!allowanceWINES) {
				return false;
			}

			if (
				selectedTokenSymbol !== TOKEN_SYMBOLS.ETH &&
				!allowanceSelectedToken
			) {
				return false;
			}

			if (!balanceETH || !balanceWINES || !balanceSelectedToken) {
				return false;
			}
		}

		return true;
	}, [
		isCrowdsale,
		tokenSupply,
		accountAddress,
		allowanceWINES,
		allowanceSelectedToken,
		balanceETH,
		balanceWINES,
		balanceSelectedToken,
		reserveWINESETH,
		reserveWINESToken,
		reserveSelectedTokenETH,
		reserveSelectedTokenToken,
		selectedTokenSymbol,
		usdExchangeRateETH,
		usdExchangeRateSelectedToken,
	]);
}

export default useTradingReady;
