import { useMemo } from "react";
import { validateBuyHelper } from "../utils/checkout-utils";

/**
 * Compute validation result for purchasing a single WINES token.
 *
 * @param {Object} params
 * @param {Object|null|undefined} params.allowanceSelectedToken
 * @param {Object|null|undefined} params.balanceETH
 * @param {Object|null|undefined} params.balanceSelectedToken
 * @param {Object|null|undefined} params.reserveWINESETH
 * @param {Object|null|undefined} params.reserveWINESToken
 * @param {Object|null|undefined} params.reserveSelectedTokenETH
 * @param {Object|null|undefined} params.reserveSelectedTokenToken
 * @param {string} params.selectedTokenSymbol
 * @returns {Object|null}
 */
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
