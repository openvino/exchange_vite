import { useMemo } from "react";
import { validateBuyHelper } from "../utils/checkout-utils";


export function useOneBottlePrice({
	allowanceSelectedToken,
	balanceETH,
	balanceSelectedToken,
	reserveWINESETH,
	reserveWINESToken,
	reserveSelectedTokenETH,
	reserveSelectedTokenToken,
	selectedTokenSymbol,
}) {
	return useMemo(() => {
		if (
			!reserveWINESETH ||
			!reserveWINESToken ||
			!selectedTokenSymbol
		) {
			return null;
		}

		return validateBuyHelper(
			"1",
			allowanceSelectedToken,
			balanceETH,
			balanceSelectedToken,
			reserveWINESETH,
			reserveWINESToken,
			reserveSelectedTokenETH,
			reserveSelectedTokenToken,
			selectedTokenSymbol
		);
	}, [
		allowanceSelectedToken,
		balanceETH,
		balanceSelectedToken,
		reserveWINESETH,
		reserveWINESToken,
		reserveSelectedTokenETH,
		reserveSelectedTokenToken,
		selectedTokenSymbol,
	]);
}

export default useOneBottlePrice;
