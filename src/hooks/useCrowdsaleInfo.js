import { useEffect, useMemo, useState } from "react";
import { BigNumber } from "ethers";

const TEN_POW_18 = BigNumber.from(10).pow(BigNumber.from(18));

const createInitialState = () => ({
	isCrowdsale: false,
	exchangeRateEth: undefined,
	exchangeRateUsd: undefined,
});

export function useCrowdsaleInfo({
	crowdsaleContract,
	crowdsaleAddress,
	usdExchangeRateETH,
}) {
	const [state, setState] = useState(createInitialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;
		async function resolveCrowdsale() {
			if (!crowdsaleContract || !crowdsaleAddress) {
				if (isMounted) {
					setState(createInitialState());
					setError(null);
					setLoading(false);
				}
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const open = await crowdsaleContract.isOpen();

				let nextExchangeRateEth;
				let nextExchangeRateUsd;

				if (open && usdExchangeRateETH) {
					const rate = await crowdsaleContract.getRate();
					const exchangeRateEth = rate.mul(TEN_POW_18);
					let exchangeRateUsd;

					if (!exchangeRateEth.isZero()) {
						exchangeRateUsd = usdExchangeRateETH
							.mul(TEN_POW_18)
							.div(exchangeRateEth);
					}

					nextExchangeRateEth = exchangeRateEth;
					nextExchangeRateUsd = exchangeRateUsd;
				}

				if (isMounted) {
					setState({
						isCrowdsale: open,
						exchangeRateEth: nextExchangeRateEth,
						exchangeRateUsd: nextExchangeRateUsd,
					});
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

		resolveCrowdsale();

		return () => {
			isMounted = false;
		};
	}, [crowdsaleContract, crowdsaleAddress, usdExchangeRateETH?.toString()]);

	const memoizedState = useMemo(() => state, [state]);

	return {
		...memoizedState,
		loading,
		error,
	};
}

export default useCrowdsaleInfo;
