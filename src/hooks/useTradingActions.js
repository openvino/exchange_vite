import { useCallback } from "react";
import { BigNumber, ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import {
	calculateGasMargin,
	getTokenContract,
	TOKEN_ADDRESSES,
	TOKEN_SYMBOLS,
} from "../utils";
import { SHIPPING_ADDRESS } from "../config";

function ensureAddress(value, message) {
	if (!value) {
		throw new Error(message);
	}
	return value;
}


export function useTradingActions({
	account,
	chain,
	client,
	library,
	routerContract,
	exchangeContractSelectedToken,
	tokenContractWINES,
	selectedTokenSymbol,
}) {
	const approveMax = useCallback(
		async (contract, spenderAddress) => {
			if (!contract || !spenderAddress) {
				throw new Error("approveMax requires contract and spender address.");
			}

			const estimatedGasLimit = await contract.estimateGas.approve(
				spenderAddress,
				ethers.constants.MaxUint256
			);

			const estimatedGasPrice = await library
				.getGasPrice()
				.then((gasPrice) =>
					gasPrice.mul(BigNumber.from(150)).div(BigNumber.from(100))
				);

			return contract.approve(spenderAddress, ethers.constants.MaxUint256, {
				gasLimit: calculateGasMargin(estimatedGasLimit),
				gasPrice: estimatedGasPrice,
			});
		},
		[library]
	);

	const unlock = useCallback(
		async (buyingWINES = true) => {
			if (buyingWINES) {
				if (selectedTokenSymbol === TOKEN_SYMBOLS.ETH) {
					// ETH does not require approval
					return null;
				}

				const exchangeAddress = exchangeContractSelectedToken?.address;
				ensureAddress(exchangeAddress, "Exchange contract not available.");

				const selectedTokenAddress = TOKEN_ADDRESSES[selectedTokenSymbol];
				ensureAddress(
					selectedTokenAddress,
					`Token address not found for ${selectedTokenSymbol}.`
				);

				const contract = getTokenContract(
					selectedTokenAddress,
					library,
					account?.address
				);

				return approveMax(contract, exchangeAddress);
			}

			ensureAddress(routerContract?.address, "Router contract not available.");
			if (!tokenContractWINES) {
				throw new Error("WINES token contract not available.");
			}

			return approveMax(tokenContractWINES, routerContract.address);
		},
		[
			account?.address,
			exchangeContractSelectedToken?.address,
			routerContract?.address,
			tokenContractWINES,
			selectedTokenSymbol,
			approveMax,
			library,
		]
	);

	const transferShippingCosts = useCallback(
		async (amount) => {
			if (!account) {
				throw new Error("Wallet not connected.");
			}

			const signer = await ethers5Adapter.signer.toEthers({
				chain,
				client,
				account,
			});

			return signer.sendTransaction({
				to: ethers.utils.getAddress(SHIPPING_ADDRESS),
				value: amount,
			});
		},
		[account, chain, client]
	);

	const burn = useCallback(
		async (amount) => {
			if (!tokenContractWINES) {
				throw new Error("WINES token contract not available.");
			}

			const parsedAmount = ethers.utils.parseUnits(amount, 18);

			const estimatedGasPrice = await library
				.getGasPrice()
				.then((gasPrice) =>
					gasPrice.mul(BigNumber.from(150)).div(BigNumber.from(100))
				);

			const estimatedGasLimit = await tokenContractWINES.estimate.burn(
				parsedAmount
			);

			return tokenContractWINES.burn(parsedAmount, {
				gasLimit: calculateGasMargin(estimatedGasLimit),
				gasPrice: estimatedGasPrice,
			});
		},
		[tokenContractWINES, library]
	);

	return {
		unlock,
		transferShippingCosts,
		burn,
	};
}

export default useTradingActions;
