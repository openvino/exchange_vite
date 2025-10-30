import { useEffect, useMemo, useState } from "react";
import { BigNumber } from "ethers";
import { TOKEN_SYMBOLS, getExchangeRate } from "../utils";
import { fetchPrice } from "../utils/fetchPrice";

const TEN_POW_18 = BigNumber.from(10).pow(BigNumber.from(18));

const createInitialState = () => ({
	rawUsdPrice: null,
	usdExchangeRateETH: undefined,
	usdExchangeRateSelectedToken: undefined,
	poolDollarPrice: undefined,
});


export function useUsdPricing({
	selectedTokenSymbol,
	reserveWINESETH,
	reserveWINESToken,
	reserveSelectedTokenETH,
	reserveSelectedTokenToken,
}) {
	const [state, setState] = useState(createInitialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;

		async function resolvePrice() {
			setLoading(true);
			setError(null);

			try {
				const usdPriceResponse = await fetchPrice();
				const normalizedPrice = normalizePrice(usdPriceResponse);

				const exchangeRateDAI = normalizedPrice
					? getExchangeRate(BigNumber.from(1), normalizedPrice)
					: undefined;

				const nextState = {
					rawUsdPrice: usdPriceResponse ?? null,
					usdExchangeRateETH: exchangeRateDAI,
					usdExchangeRateSelectedToken: undefined,
					poolDollarPrice: undefined,
				};

				if (
					exchangeRateDAI &&
					reserveWINESETH &&
					reserveWINESToken &&
					!reserveWINESETH.isZero() &&
					!reserveWINESToken.isZero()
				) {
					const winesExchangeRateETH = getExchangeRate(
						reserveWINESToken,
						reserveWINESETH
					);

					if (winesExchangeRateETH) {
						nextState.poolDollarPrice = winesExchangeRateETH
							.mul(exchangeRateDAI)
							.div(TEN_POW_18);
					}
				}

				if (
					exchangeRateDAI &&
					selectedTokenSymbol !== TOKEN_SYMBOLS.ETH &&
					reserveSelectedTokenETH &&
					reserveSelectedTokenToken &&
					!reserveSelectedTokenETH.isZero() &&
					!reserveSelectedTokenToken.isZero()
				) {
					const exchangeRateSelectedToken = getExchangeRate(
						reserveSelectedTokenETH,
						reserveSelectedTokenToken
					);

					if (exchangeRateSelectedToken) {
						nextState.usdExchangeRateSelectedToken = exchangeRateDAI
							.mul(TEN_POW_18)
							.div(exchangeRateSelectedToken);
					}
				}

				if (isMounted) {
					setState(nextState);
				}
			} catch (err) {
				if (isMounted) {
					setError(err);
					setState(createInitialState());
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		resolvePrice();

		return () => {
			isMounted = false;
		};
	}, [
		selectedTokenSymbol,
		reserveWINESETH?.toString(),
		reserveWINESToken?.toString(),
		reserveSelectedTokenETH?.toString(),
		reserveSelectedTokenToken?.toString(),
	]);

	const memoizedState = useMemo(() => state, [state]);

	return {
		...memoizedState,
		loading,
		error,
	};
}

function normalizePrice(value) {
	if (value === null || value === undefined) {
		return undefined;
	}

	try {
		if (BigNumber.isBigNumber(value)) {
			return value;
		}

		const asString = String(value).trim();
		if (!asString) {
			return undefined;
		}

		// ethers.js BigNumber only supports integers; approximate by removing decimals.
		const integerPart = asString.split(".")[0];
		if (!integerPart) {
			return undefined;
		}

		const parsed = BigNumber.from(integerPart);
		return parsed.isNegative() ? undefined : parsed;
	} catch (error) {
		console.error("Failed to normalize price", error);
		return undefined;
	}
}

export default useUsdPricing;
