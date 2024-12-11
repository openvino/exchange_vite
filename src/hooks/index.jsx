import React, { useEffect, useState, useCallback, useMemo } from "react";
import { client } from "../config/thirdwebClient";
import { defineChain, base } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import FACTORY_ABI from '../contracts/factory.json';
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
  const [pairAddress, setPairAddress] = useState(null); // Estado para guardar la dirección del par
  const library = ethers5Adapter.provider.toEthers({
    client,
    chain: base,
  });

  const account = useActiveAccount();

  useEffect(() => {
    const fetchPairAddress = async () => {
      try {
        if (tokenAddress) {
          const factoryAddress = import.meta.env.VITE_FACTORY_ADDRESS;
          const token1 = import.meta.env.VITE_WETH_ADDRESS; // WETH
          const token0 = tokenAddress;

          const factoryContract = getContract(factoryAddress, FACTORY_ABI, library);

          const pairAddress = await factoryContract.getPair(token0, token1); // Espera que se resuelva la promesa
          setPairAddress(pairAddress); // Guarda la dirección del par en el estado
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



export function useReserves(pairContract) {
  const [reserves, setReserves] = useState({ reserve0: null, reserve1: null });
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);

  const updateReserves = useCallback(() => {
    if (!!pairContract) {
      pairContract
        .getReserves()
        .then((value) => {
          setReserves({ reserve0: value[0], reserve1: value[1] });
        })
        .catch(() => {
          setReserves({ reserve0: null, reserve1: null });
        });

      pairContract
        .token0()
        .then(setToken0)
        .catch(() => setToken0(null));
      pairContract
        .token1()
        .then(setToken1)
        .catch(() => setToken1(null));

      return () => {
        setReserves({ reserve0: null, reserve1: null });
      };
    }
  }, [pairContract]);

  useEffect(() => {
    updateReserves();
  }, [updateReserves]);

  if (token0 && token1) {
    return { reserves, token0, token1 };
  } else {
    return {
      reserves: { reserve0: null, reserve1: null },
      token0: null,
      token1: null,
    };
  }
}


// Objeto de caché para almacenar balances temporalmente
const balanceCache = new Map();

export function useAddressBalance(address, tokenAddress, refreshTrigger) {
  const library = ethers5Adapter.provider.toEthers({
    client,
    chain: base,
  });

  // const library = new ethers.providers.JsonRpcProvider("https://base-mainnet.infura.io/v3/ce8d632a5fdf485ea8e0f041b48c3f69");

  const [balance, setBalance] = useState();

  const updateBalance = useCallback(() => {
    if (isAddress(address) && (tokenAddress === "ETH" || isAddress(tokenAddress))) {
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

  return tokenSupply && Math.round(Number(ethers.utils.formatEther(tokenSupply)));
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

export function useAddressAllowance(address, tokenAddress, spenderAddress, refreshTrigger) {


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
