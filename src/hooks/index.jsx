import React, { useEffect, useState, useCallback, useMemo } from "react";
import { client } from "../config/thirdwebClient";
import { defineChain, base } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import FACTORY_ABI from "../contracts/factory.json";
import {
	isAddress,
	getTokenContract,
	getExchangeContract,
	getEtherBalance,
	getTokenBalance,
	getTokenAllowance,
	TOKEN_ADDRESSES,
	ROUTER_ADDRESS,
	getCrowdsaleContract,
	getPairContract,
	getNetworkId,
	getRouterContract,
	getContract,
} from "../utils";
import { ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import debounce from "lodash.debounce";
import { getPairAddressFromTokenAddress } from "../utils/whitelistedPools";
const library = ethers5Adapter.provider.toEthers({
	client,
	chain: base,
});

export function useCrowdsaleContract(
	crowdsaleAddress,
	withSignerIfPossible = true
) {
	const account = useActiveAccount();
	const debouncedFetch = useCallback(
		debounce(() => {
			return getCrowdsaleContract(
				crowdsaleAddress,
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		}, 1000),
		[account?.address, crowdsaleAddress, withSignerIfPossible]
	);
	return useMemo(() => debouncedFetch(), [debouncedFetch]);
}

//
export function useTokenContract(tokenAddress, withSignerIfPossible = true) {
	const account = useActiveAccount();
	const [contract, setContract] = useState(null); // Nuevo estado para almacenar el contrato

	const debouncedFetch = useCallback(
		debounce(async () => {
			if (!isAddress(tokenAddress)) return;
			try {
				const contractInstance = getTokenContract(
					tokenAddress,
					library,
					withSignerIfPossible ? account?.address : undefined
				);
				console.log("Contrato obtenido:", contractInstance);
				setContract(contractInstance); // Almacenar el contrato en el estado
			} catch (e) {
				console.error("Error obteniendo el contrato del token:", e);
				setContract(null);
			}
		}, 1000),
		[account?.address, tokenAddress, withSignerIfPossible]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return contract;
}

export function useRouterContract(withSignerIfPossible = true) {
	const account = useActiveAccount();

	const debouncedFetch = useCallback(
		debounce(() => {
			return getRouterContract(
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		}, 1000),
		[account?.address, withSignerIfPossible]
	);
	return useMemo(() => debouncedFetch(), [debouncedFetch]);
}

export function useExchangeContract(tokenAddress, withSignerIfPossible = true) {
	const account = useActiveAccount();
	const exchangeAddress = import.meta.env.VITE_FACTORY_ADDRESS;

	const debouncedFetch = useCallback(
		debounce(() => {
			try {
				return getExchangeContract(
					exchangeAddress,
					library,
					withSignerIfPossible ? account?.address : undefined
				);
			} catch (e) {
				console.log(e);
				return null;
			}
		}, 1000),
		[exchangeAddress, withSignerIfPossible, account?.address]
	);

	return useMemo(() => debouncedFetch(), [debouncedFetch]);
}

export function usePairContract(tokenAddress, withSignerIfPossible = true) {
	const [pairAddress, setPairAddress] = useState(null);
	const account = useActiveAccount();

	const debouncedFetch = useCallback(
		debounce(async () => {
			try {
				if (!isAddress(tokenAddress)) return;
				const pairAddr = getPairAddressFromTokenAddress(tokenAddress);
				setPairAddress(pairAddr);
			} catch (error) {
				console.error("Error obteniendo la dirección del par:", error);
			}
		}, 1000),
		[tokenAddress]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return useMemo(() => {
		if (!isAddress(pairAddress)) return null;
		return getPairContract(
			pairAddress,
			library,
			withSignerIfPossible ? account?.address : undefined
		);
	}, [pairAddress, withSignerIfPossible, account?.address]);
}

export function useReserves(pairContract) {
	const [reserves, setReserves] = useState({ reserve0: null, reserve1: null });
	const [token0, setToken0] = useState(null);
	const [token1, setToken1] = useState(null);

	const debouncedFetch = useCallback(
		debounce(async () => {
			if (!pairContract) return;
			try {
				const [reserve0, reserve1] = await pairContract.getReserves();
				setReserves({ reserve0, reserve1 });
				setToken0(await pairContract.token0());
				setToken1(await pairContract.token1());
			} catch (error) {
				console.error("Error obteniendo reservas del par:", error);
				setReserves({ reserve0: null, reserve1: null });
				setToken0(null);
				setToken1(null);
			}
		}, 1000),
		[pairContract]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return { reserves, token0, token1 };
}

export function useAddressBalance(address, tokenAddress, refreshTrigger) {
	const [balance, setBalance] = useState();

	const debouncedFetch = useCallback(
		debounce(async () => {
			if (
				isAddress(address) &&
				(tokenAddress === "ETH" || isAddress(tokenAddress))
			) {
				try {
					const value =
						tokenAddress === "ETH"
							? await getEtherBalance(address, library)
							: await getTokenBalance(tokenAddress, address, library);
					setBalance(value);
				} catch (error) {
					console.error("Error obteniendo balance:", error);
					setBalance(null);
				}
			}
		}, 1000),
		[address, tokenAddress, refreshTrigger]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return balance;
}

export function useTokenSupply(contract) {
	const [tokenSupply, setTokenSupply] = useState();

	const updateTokenSupply = useCallback(() => {
		if (!!contract) {
			let stale = false;

			contract
				.totalSupply()
				.then((value) => {
					if (!stale) {
						setTokenSupply(value);
					}
				})
				.catch(() => {
					if (!stale) {
						setTokenSupply(null);
					}
				});
			return () => {
				stale = true;
				setTokenSupply();
			};
		}
	}, [contract]);

	useEffect(() => {
		return updateTokenSupply();
	}, [updateTokenSupply]);

	// useBlockEffect(updateTokenSupply)

	return (
		tokenSupply && Math.round(Number(ethers.utils.formatEther(tokenSupply)))
	);
}

export function useTokenCap(contract) {
	console.log("TOKENCONTRACT", contract);

	const [tokenCap, setTokenCap] = useState();

	const updateTokenCap = useCallback(() => {
		if (!!contract) {
			let stale = false;

			contract
				.cap()
				.then((value) => {
					if (!stale) {
						setTokenCap(value);
					}
				})
				.catch(() => {
					if (!stale) {
						setTokenCap(null);
					}
				});
			return () => {
				stale = true;
				setTokenCap();
			};
		}
	}, [contract]);

	useEffect(() => {
		return updateTokenCap();
	}, [updateTokenCap]);

	// useBlockEffect(updateTokenCap)

	return tokenCap && Math.round(Number(ethers.utils.formatEther(tokenCap)));
}

export function useExchangeReserves(exchangeContract) {
	const [reserves, setReserves] = useState({ reserve0: null, reserve1: null });

	const debouncedFetch = useCallback(
		debounce(async () => {
			if (!exchangeContract) return;
			try {
				const [reserve0, reserve1] = await exchangeContract.getReserves();
				setReserves({ reserve0, reserve1 });
			} catch (error) {
				console.error("Error obteniendo reservas del exchange:", error);
				setReserves({ reserve0: null, reserve1: null });
			}
		}, 1000),
		[exchangeContract]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return reserves;
}

export function useAddressAllowance(
	address,
	tokenAddress,
	spenderAddress,
	refreshTrigger
) {
	const [allowance, setAllowance] = useState();

	const debouncedFetch = useCallback(
		debounce(async () => {
			if (
				isAddress(address) &&
				isAddress(tokenAddress) &&
				isAddress(spenderAddress)
			) {
				try {
					const value = await getTokenAllowance(
						address,
						tokenAddress,
						spenderAddress,
						library
					);
					setAllowance(value);
				} catch (error) {
					console.error("Error obteniendo allowance:", error);
					setAllowance(null);
				}
			}
		}, 1000),
		[address, tokenAddress, spenderAddress, refreshTrigger]
	);

	useEffect(() => {
		debouncedFetch();
	}, [debouncedFetch]);

	return allowance;
}

export function useExchangeAllowance(address, tokenAddress) {
	const exchangeContract = useExchangeContract(tokenAddress);

	return useAddressAllowance(
		address,
		tokenAddress,
		exchangeContract && exchangeContract.address
	);
}

export function useRouterAllowance(address, tokenAddress) {
	const routerContract = useRouterContract();

	return useAddressAllowance(
		address,
		tokenAddress,
		routerContract && routerContract.address
	);
}
