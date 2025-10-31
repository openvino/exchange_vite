import { BigNumber } from "ethers";

const TEN_POW_18 = BigNumber.from(10).pow(BigNumber.from(18));
const ZERO = BigNumber.from(0);

/**
 * Convert a token amount into its dollarized representation using a given exchange rate.
 *
 * @param {BigNumber|undefined|null} amount
 * @param {BigNumber|undefined|null} exchangeRate
 * @returns {BigNumber}
 */
export function dollarize(amount, exchangeRate) {
	if (!amount || !exchangeRate) {
		return ZERO;
	}

	return amount.mul(exchangeRate).div(TEN_POW_18);
}

export default dollarize;
