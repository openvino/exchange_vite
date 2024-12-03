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
	calculateEtherTokenInputFromOutput,
	getExchangeRate,
	calculateSlippageBounds,
} from "../utils";
import { ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { getPairAddress } from "../utils/pools";
import { fetchPrice } from "../utils/fetchPrice";

const wethAddress = import.meta.env.VITE_WETH_ADDRESS;
export function useCrowdsaleContract(
	crowdsaleAddress,
	withSignerIfPossible = true
) {
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const account = useActiveAccount();

	return useMemo(() => {
		try {
			return getCrowdsaleContract(
				crowdsaleAddress,
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		} catch {
			return null;
		}
	}, [account?.address, crowdsaleAddress, withSignerIfPossible]);
}

export function useTokenContract(tokenAddress, withSignerIfPossible = true) {
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const account = useActiveAccount();

	return useMemo(() => {
		try {
			return getTokenContract(
				tokenAddress,
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		} catch {
			return null;
		}
	}, [account?.address]);
}

export function useRouterContract(withSignerIfPossible = true) {
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const account = useActiveAccount();

	return useMemo(() => {
		try {
			return getRouterContract(
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		} catch (e) {
			return null;
		}
	}, [account?.address, library, withSignerIfPossible]);
}

export function useExchangeContract(tokenAddress, withSignerIfPossible = true) {
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const account = useActiveAccount();

	const [exchangeAddress, setExchangeAddress] = useState();
	// useEffect(() => {
	//   if (isAddress(tokenAddress)) {
	//     let stale = false;
	//     getTokenExchangeAddressFromFactory(tokenAddress, library).then(
	//       (exchangeAddress) => {
	//         if (!stale) {
	//           setExchangeAddress(exchangeAddress);
	//         }
	//       }
	//     );
	//     return () => {
	//       stale = true;
	//       setExchangeAddress();
	//     };
	//   }
	// }, [library, tokenAddress]);

	return useMemo(() => {
		try {
			return getExchangeContract(
				exchangeAddress,
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		} catch (e) {
			return null;
		}
	}, [exchangeAddress, withSignerIfPossible, account?.address]);
}

export function usePairContract(tokenAddress, withSignerIfPossible = true) {
	const [pairAddress, setPairAddress] = useState(null);
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const account = useActiveAccount();

	useEffect(() => {
		const fetchPairAddress = async () => {
			try {
				if (tokenAddress) {
					const address = getPairAddress(tokenAddress);
					console.log(address);
					setPairAddress(address);
					const pairAddress = await factoryContract.getPair(token0, token1); // Espera que se resuelva la promesa
					console.log("Pair address:", pairAddress);

					setPairAddress(address); // Guarda la dirección del par en el estado
				}
			} catch (error) {
				console.error("Error obteniendo la dirección del par:", error);
			}
		};

		fetchPairAddress();
	}, [tokenAddress, library]);

	return useMemo(() => {
		if (pairAddress) {
			return getPairContract(
				pairAddress,
				library,
				withSignerIfPossible ? account?.address : undefined
			);
		}
	}, [pairAddress, withSignerIfPossible]);
}

const pairObj = async (tokenAddress, library, signer) => {
	console.log("HOLA!!!", tokenAddress);

	try {
		if (tokenAddress) {
			const address = getPairAddress(tokenAddress);

			const pairContractObj = await getPairContract(
				address,
				library,
				signer ? signer : undefined
			);

			console.log("Pair address:", pairContractObj);

			return pairContractObj;
		}
	} catch (error) {
		console.error("Error obteniendo la dirección del par:", error);
	}
};
// export const useReserves = (tokenAddress, account) => {
// 	console.log(tokenAddress, account);
// 	const provider = new ethers.providers.JsonRpcProvider(
// 		import.meta.env.VITE_PROVIDER_BASE
// 	);
// 	console.log(provider);

// 	const library = provider;
// 	// const library = ethers5Adapter.provider.toEthers({
// 	// 	client,
// 	// 	chain: base,
// 	// });

// 	const [pairAddress, setPairAddress] = useState(null);
// 	const [reserves, setReserves] = useState({
// 		reserve0: null,
// 		reserve1: null,
// 	});
// 	const [token0, setToken0] = useState(null);
// 	const [token1, setToken1] = useState(null);
// 	const [reserveWINESETH, setReserveWINESETH] = useState(null);
// 	const [reserveWINESToken, setReserveWINESToken] = useState(null);

// 	useEffect(() => {
// 		const fetchReserves = async () => {
// 			try {
// 				const pairClient = await pairObj(
// 					tokenAddress,
// 					library,
// 					account?.address
// 				);

// 				console.log(pairClient);
// 				console.log(pairClient?.address);

// 				setPairAddress(pairClient?.address || null);

// 				const poolReserves = await pairClient?.getReserves();
// 				const tokenAddress0 = await pairClient?.token0();
// 				const tokenAddress1 = await pairClient?.token1();
// 				setToken0(tokenAddress0);
// 				setToken1(tokenAddress1);
// 				setReserves(poolReserves);
// 				console.log(tokenAddress0);
// 				console.log(tokenAddress1);
// 				console.log(poolReserves);

// 				const ethReserve =
// 					tokenAddress0 === wethAddress
// 						? poolReserves[0]
// 						: tokenAddress1 === wethAddress
// 						? poolReserves[1]
// 						: null;

// 				const tokenReserve =
// 					tokenAddress0 === tokenAddress
// 						? poolReserves[0]
// 						: tokenAddress1 === tokenAddress
// 						? poolReserves[1]
// 						: null;
// 				console.log(ethReserve, tokenReserve);

// 				setReserveWINESETH(ethReserve);

// 				setReserveWINESToken(tokenReserve);
// 				const usdEthRate = await fetchPrice();

// 				console.log(amount.toString());

// 				const rate = getExchangeRate(tokenReserve, ethReserve);
// 				console.log(rate);

// 				console.log(rate * usdEthRate);

// 				// console.log(usdEthRate, ethers.B(usdEthRate));
// 				const price = tokenReserve
// 					.div(ethReserve)
// 					.mul(ethers.utils.parseUnits(usdEthRate));
// 				console.log(price.toString());
// 			} catch (error) {
// 				console.log(error);
// 			}
// 		};

// 		fetchReserves();
// 	}, [tokenAddress]);

// 	if (token0 && token1) {
// 		return {
// 			reserves,
// 			token0,
// 			token1,
// 			pairAddress,
// 			reserveWINESETH,
// 			reserveWINESToken,
// 		};
// 	} else {
// 		return {
// 			reserves: { reserve0: null, reserve1: null, pairAddress: null },
// 			token0: null,
// 			token1: null,
// 		};
// 	}
// };

// Objeto de caché para almacenar balances temporalmente
const balanceCache = new Map();
export const useReserves = (tokenAddress, account) => {
	console.log(tokenAddress, account);

	// Configurar proveedor
	const provider = new ethers.providers.JsonRpcProvider(
		import.meta.env.VITE_PROVIDER_BASE
	);

	const [pairAddress, setPairAddress] = useState(null);
	const [reserves, setReserves] = useState({
		reserve0: null,
		reserve1: null,
	});
	const [token0, setToken0] = useState(null);
	const [token1, setToken1] = useState(null);
	const [reserveETH, setReserveETH] = useState(null);
	const [reserveToken, setReserveToken] = useState(null);

	useEffect(() => {
		const fetchReserves = async () => {
			try {
				// Obtener el contrato del par
				const pairClient = await pairObj(
					tokenAddress,
					provider,
					account?.address
				);

				setPairAddress(pairClient?.address || null);

				// Obtener reservas del par
				const poolReserves = await pairClient?.getReserves();
				const tokenAddress0 = await pairClient?.token0();
				const tokenAddress1 = await pairClient?.token1();

				setToken0(tokenAddress0);
				setToken1(tokenAddress1);
				setReserves(poolReserves);

				// Determinar cuál reserva es ETH y cuál es el token
				const ethReserve =
					tokenAddress0 === wethAddress
						? poolReserves[0]
						: tokenAddress1 === wethAddress
						? poolReserves[1]
						: null;

				const tokenReserve =
					tokenAddress0 === tokenAddress
						? poolReserves[0]
						: tokenAddress1 === tokenAddress
						? poolReserves[1]
						: null;

				setReserveETH(ethReserve);
				setReserveToken(tokenReserve);

				// Obtener precio de ETH en USD
				const usdEthRate = await fetchPrice(); // Devuelve un string o número
				const ethPriceInUSD = ethers.utils.parseUnits(usdEthRate, 8); // Usar 8 decimales para USD

				// Calcular precio del token en ETH
				let tokenPriceInETH = ethReserve
					.mul(ethers.BigNumber.from(10).pow(18)) // Normalizar a 18 decimales
					.div(tokenReserve);

				console.log(tokenPriceInETH);

				const tokenPriceInETH2 = calculateSlippageBounds(tokenPriceInETH);
				console.log(tokenPriceInETH2);

				// Convertir precio del token a USD
				const tokenPriceInUSD = tokenPriceInETH
					.mul(ethPriceInUSD)
					.div(ethers.BigNumber.from(10).pow(18 + 8));

				console.log("Token Price in ETH:", tokenPriceInETH2.maximum.toString());
				console.log("Token Price in USD:", tokenPriceInUSD.toString());
			} catch (error) {
				console.error("Error fetching reserves or calculating price:", error);
			}
		};

		fetchReserves();
	}, [tokenAddress]);

	if (token0 && token1) {
		return {
			reserves,
			token0,
			token1,
			pairAddress,
			reserveETH,
			reserveToken,
		};
	} else {
		return {
			reserves: { reserve0: null, reserve1: null, pairAddress: null },
			token0: null,
			token1: null,
		};
	}
};
export function useAddressBalance(address, tokenAddress, refreshTrigger) {
	// const library = ethers5Adapter.provider.toEthers({
	//   client,
	//   chain: base,
	// });

	const library = new ethers.providers.JsonRpcProvider(
		"https://base-mainnet.infura.io/v3/ce8d632a5fdf485ea8e0f041b48c3f69"
	);

	const [balance, setBalance] = useState();

	const updateBalance = useCallback(() => {
		if (
			isAddress(address) &&
			(tokenAddress === "ETH" || isAddress(tokenAddress))
		) {
			const cacheKey = `${address}-${tokenAddress}`;

			// Verificar si el balance ya está en caché
			if (balanceCache.has(cacheKey)) {
				setBalance(balanceCache.get(cacheKey));
				return;
			}

			let stale = false;

			(tokenAddress === "ETH"
				? getEtherBalance(address, library)
				: getTokenBalance(tokenAddress, address, library)
			)
				.then((value) => {
					if (!stale) {
						setBalance(value);
						balanceCache.set(cacheKey, value); // Guardar en caché
					}
				})
				.catch((error) => {
					if (!stale) {
						setBalance(null);
					}
				});

			return () => {
				stale = true;
				setBalance();
			};
		}
	}, [address, tokenAddress, refreshTrigger]);

	useEffect(() => {
		return updateBalance();
	}, [updateBalance]);

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

export function useExchangeReserves(tokenAddress) {
	const exchangeContract = useExchangeContract(tokenAddress);

	const reserveETH = useAddressBalance(
		exchangeContract && exchangeContract.address,
		TOKEN_ADDRESSES.ETH
	);
	const reserveToken = useAddressBalance(
		exchangeContract && exchangeContract.address,
		tokenAddress
	);

	return { reserveETH, reserveToken };
}

export function useAddressAllowance(
	address,
	tokenAddress,
	spenderAddress,
	refreshTrigger
) {
	const library = ethers5Adapter.provider.toEthers({
		client,
		chain: base,
	});

	const [allowance, setAllowance] = useState();

	const updateAllowance = useCallback(() => {
		if (
			isAddress(address) &&
			isAddress(tokenAddress) &&
			isAddress(spenderAddress)
		) {
			let stale = false;

			getTokenAllowance(address, tokenAddress, spenderAddress, library)
				.then((allowance) => {
					if (!stale) {
						setAllowance(allowance);
					}
				})
				.catch(() => {
					if (!stale) {
						setAllowance(null);
					}
				});

			return () => {
				stale = true;
				setAllowance();
			};
		}
	}, [address, spenderAddress, tokenAddress, refreshTrigger]);

	useEffect(() => {
		return updateAllowance();
	}, [updateAllowance]);

	// useBlockEffect(updateAllowance)

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
