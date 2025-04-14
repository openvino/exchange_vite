import React, { useEffect, useState, useCallback, useMemo } from "react";
import Checkout from "./checkout/Checkout";
import BeatLoader from "react-spinners/BeatLoader";
import { useAppContext } from "../context";
import { TradeButtons } from "./shared/TradeButtons";
import { BigNumber, ethers } from "ethers";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { client } from "../config/thirdwebClient";
import { base } from "thirdweb/chains";
import styles from "./Header/Header.module.css";
import {
	TOKEN_SYMBOLS,
	TRADE_TYPES,
	getExchangeRate,
	calculateGasMargin,
	amountFormatter,
} from "../utils";
import {
	validateBuyHelper,
	validateCrowdsaleHelper,
	validateSellHelper,
} from "../utils/checkout-utils";
import {
	useAddressAllowance,
	useRouterAllowance,
	useTokenSupply,
	useTokenCap,
	useReserves,
} from "../hooks";
import Farming from "./farming/Farming";
import { fetchPrice } from "../utils/fetchPrice";
import {
	CardWrapper,
	Container,
	CurrentPrice,
	Farm,
	Image,
	ImageContainer,
	InfoIcon,
	MarketData,
	Redeem,
	Title,
	TokenIcon,
	TokenIconContainer,
	TokenIconText,
} from "../styles";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useParams } from "react-router-dom";
import { axiosClient } from "../config/axiosClient";
import Header from "./Header/Header";
import Tabs from "./Tabs/Tabs";
import Sensors from "./Sensors/Sensors";
import { useAllBalances } from "../hooks";
import { useContracts } from "../hooks";
import { Height } from "@styled-icons/material";
import useWeb3Store from "../config/zustandStore";
import Countdown from "./countdown/Countdown";
import { getTokenImageUrl } from "../utils/getStaticImages";
import { useRef } from "react";
import { Spinner } from "@styled-icons/icomoon";

export default function Main(key, setKey) {
	const library = useMemo(() => {
		return ethers5Adapter.provider.toEthers({
			client,
			chain: base,
		});
	}, [client]);
	// selected token
	const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(
		TOKEN_SYMBOLS.ETH
	);
	const [USDExchangeRateETH, setUSDExchangeRateETH] = useState();
	const [USDExchangeRateSelectedToken, setUSDExchangeRateSelectedToken] =
		useState();

	const [loadingPrice, setLoadingPrice] = useState(false);
	const priceRef = useRef(null);
	const account = useActiveAccount();
	const { wineryId, productId } = useParams();
	const [state, setState] = useAppContext();
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const {
		tokenContractWINES,
		exchangeContractSelectedToken,
		routerContract,
		pairMTBwETH,
		crowdsaleContract,
	} = useContracts(state?.tokenAddress, state?.crowdsaleAddress);

	useEffect(() => {
		window.scrollTo(0, 0);
		setState((state) => ({ ...state, visible: false }));
	}, []);

	useEffect(() => {
		// Si el precio es válido, ocultar el loader
		if (priceRef.current && priceRef.current !== "~<0") {
			setLoadingPrice(false);
		}

		// Si el precio es "~<0", forzar un re-render
		if (priceRef.current === "~<0") {
			setKey((prevKey) => prevKey + 1);
		}
	}, [state.validationState, dollarize(state?.validationState)]);
	const getProductList = async () => {
		const productsWineries = await axiosClient.get("/token", {
			params: { winerie_id: wineryId },
		});
		console.log(productsWineries.data);

		const filterProduct = productsWineries.data.filter(
			(product) => product.id === productId
		);

		const { bottleUrl, imageUrl, tokenUrl } = getTokenImageUrl(
			filterProduct[0].id.toLowerCase(),
			filterProduct[0].WinerieID.toLowerCase()
		);

		setState((prevState) => ({
			...prevState,
			apiUrl: import.meta.env.VITE_APIURL,
			crowdsaleAddress: filterProduct[0].crow_sale_address,
			wineryId: filterProduct[0].WinerieID,
			tokenAddress: filterProduct[0].token_address,
			image: bottleUrl,
			tokenYear: filterProduct[0].year.toString(),
			tokenName: filterProduct[0].id,
			tokenIcon: tokenUrl,
			title: "Token",
			shippingAccount: filterProduct[0].shipping_account,
			validationState: undefined,
			loading: true,
		}));

		// setProduct(productsWineries.data);
	};

	useEffect(() => {
		setUSDExchangeRateETH(undefined);
		setUSDExchangeRateSelectedToken(undefined);
		setDollarPrice(undefined);

		getProductList();
	}, [productId, wineryId]);

	const [showFarming, setShowFarming] = useState(false);

	// get balances
	const {
		balanceETH,
		balanceWINES,
		balanceSelectedToken,
		reserveDAIETH,
		reserveDAIToken,
		reserveSelectedTokenETH,
		reserveSelectedTokenToken,
	} = useAllBalances(
		account?.address,
		state?.tokenAddress,
		selectedTokenSymbol,
		refreshTrigger
	);

	// tokenSupply
	const tokenSupply = useTokenSupply(tokenContractWINES);

	// token cap
	const tokenCap = useTokenCap(tokenContractWINES);

	// get allowances
	const allowanceWINES = useAddressAllowance(
		account?.address,
		state?.tokenAddress,
		routerContract && routerContract.address,
		refreshTrigger
	);

	const allowanceSelectedToken = useRouterAllowance(
		account?.address,
		state?.tokenAddress,
		refreshTrigger
	);

	const { reserves, token0, token1 } = useReserves(pairMTBwETH);

	const reserveWINESETH =
		token0 === import.meta.env.VITE_WETH_ADDRESS
			? reserves.reserve0
			: reserves.reserve1;
	const reserveWINESToken =
		token1 === state.tokenAddress ? reserves.reserve1 : reserves.reserve0;

	useEffect(() => {
		const fetchPriceAndSetState = async () => {
			try {
				const usdPrice = await fetchPrice();
				const formatedUsdPrice = usdPrice.split(".")[0];
				const exchangeRateDAI = getExchangeRate(
					BigNumber.from(1),
					BigNumber.from(Number(formatedUsdPrice))
				);

				if (selectedTokenSymbol === TOKEN_SYMBOLS.ETH) {
					setUSDExchangeRateETH(exchangeRateDAI);
				} else {
					const exchangeRateSelectedToken = getExchangeRate(
						reserveSelectedTokenETH,
						reserveSelectedTokenToken
					);
					if (exchangeRateDAI && exchangeRateSelectedToken) {
						setUSDExchangeRateSelectedToken(
							exchangeRateDAI
								.mul(BigNumber.from(10).pow(BigNumber.from(18)))
								.div(exchangeRateSelectedToken)
						);
					}
				}
			} catch (error) {
				console.log(error);
				setUSDExchangeRateETH();
				setUSDExchangeRateSelectedToken();
			}
		};

		fetchPriceAndSetState();
	}, [
		reserveDAIETH,
		reserveDAIToken,
		reserveSelectedTokenETH,
		reserveSelectedTokenToken,
		selectedTokenSymbol,
	]);

	let [isCrowdsale, setCrowdsale] = useState();

	useEffect(() => {
		try {
			if (state.crowdsaleAddress === "") {
				setCrowdsale(false);
				return;
			}

			crowdsaleContract
				.isOpen()
				.then((open) => {
					setCrowdsale(open);
				})
				.catch((error) => {
					setCrowdsale(false);
				});
		} catch {
			setCrowdsale();
		}
	}, [crowdsaleContract]);

	const [crowdsaleExchangeRateETH, setCrowdsaleExchangeRateETH] = useState(0);
	const [crowdsaleExchangeRateUSD, setCrowdsaleExchangeRateUSD] = useState(0);

	//Crowdsale price
	useEffect(() => {
		try {
			crowdsaleContract
				.rate()
				.then((rate) => {
					const exchangeRateETH = rate.mul(
						BigNumber.from(10).pow(BigNumber.from(18))
					);
					setCrowdsaleExchangeRateETH(exchangeRateETH);

					const exchangeRateUSD = USDExchangeRateETH.mul(
						BigNumber.from(10).pow(BigNumber.from(18))
					).div(exchangeRateETH);
					setCrowdsaleExchangeRateUSD(exchangeRateUSD);
				})
				.catch((error) => {
					console.log(error);

					setCrowdsaleExchangeRateETH();
					setCrowdsaleExchangeRateUSD();
				});
		} catch {
			setCrowdsaleExchangeRateETH();
			setCrowdsaleExchangeRateUSD();
		}
	}, [crowdsaleContract, USDExchangeRateETH]);

	const ready = !!(
		(isCrowdsale && tokenCap > tokenSupply + 6) ||
		(!isCrowdsale &&
			(account?.address === null || allowanceWINES) &&
			(selectedTokenSymbol === "ETH" ||
				account?.address === null ||
				allowanceSelectedToken) &&
			(account?.address === null || balanceETH) &&
			(account?.address === null || balanceWINES) &&
			(account?.address === null || balanceSelectedToken) &&
			reserveWINESETH &&
			reserveWINESToken &&
			(selectedTokenSymbol === "ETH" || reserveSelectedTokenETH) &&
			(selectedTokenSymbol === "ETH" || reserveSelectedTokenToken) &&
			selectedTokenSymbol &&
			(USDExchangeRateETH || USDExchangeRateSelectedToken))
	);

	function _dollarize(amount, exchangeRate) {
		if (exchangeRate) {
			return amount
				?.mul(exchangeRate)
				.div(BigNumber.from(10).pow(BigNumber.from(18)));
		}

		return BigNumber.from(0);
	}

	function dollarize(amount) {
		return _dollarize(
			amount,
			selectedTokenSymbol === TOKEN_SYMBOLS.ETH
				? USDExchangeRateETH
				: USDExchangeRateSelectedToken
		);
	}

	const [dollarPrice, setDollarPrice] = useState();

	//Pool price
	useEffect(() => {
		if (USDExchangeRateETH && reserveWINESETH && reserveWINESToken) {
			try {
				setLoadingPrice(true);
				const WINESExchangeRateETH = getExchangeRate(
					reserveWINESToken,
					reserveWINESETH
				);
				setDollarPrice(
					WINESExchangeRateETH.mul(USDExchangeRateETH).div(
						BigNumber.from(10).pow(BigNumber.from(18))
					)
				);
			} catch (error) {
				console.log(error);
			}
		}
	}, [USDExchangeRateETH, reserveWINESETH, reserveWINESToken]);

	useEffect(() => {
		if (typeof state.validationState !== "undefined") setLoadingPrice(false);
	}, [state.validationState]);
	async function unlock(buyingWINES = true) {
		const contract = buyingWINES
			? tokenContractSelectedToken
			: tokenContractWINES;
		const spenderAddress = buyingWINES
			? exchangeContractSelectedToken.address
			: routerContract.address;

		console.log(
			"Unlocking...",
			tokenContractSelectedToken,
			tokenContractWINES,
			contract
		);
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
	}

	// buy functionality
	const validateBuy = useCallback(
		(numberOfWINES) => {
			return validateBuyHelper(
				numberOfWINES,
				allowanceSelectedToken,
				balanceETH,
				balanceSelectedToken,
				reserveWINESETH,
				reserveWINESToken,
				reserveSelectedTokenETH,
				reserveSelectedTokenToken,
				selectedTokenSymbol
			);
		},
		[
			allowanceSelectedToken,
			balanceETH,
			balanceSelectedToken,
			reserveWINESETH,
			reserveWINESToken,
			reserveSelectedTokenETH,
			reserveSelectedTokenToken,
			selectedTokenSymbol,
			refreshTrigger,
		]
	);

	// crowdsale functionality
	const validateCrowdsale = useCallback(
		(numberOfWINES) => {
			return validateCrowdsaleHelper(
				numberOfWINES,
				allowanceSelectedToken,
				balanceETH,
				balanceSelectedToken,
				crowdsaleExchangeRateETH,
				selectedTokenSymbol
			);
		},
		[
			allowanceSelectedToken,
			balanceETH,
			balanceSelectedToken,
			crowdsaleExchangeRateETH,
			selectedTokenSymbol,
		]
	);

	// sell functionality
	const validateSell = useCallback(
		(numberOfWINES) => {
			return validateSellHelper(
				numberOfWINES,
				allowanceWINES,
				balanceETH,
				balanceWINES,
				reserveWINESETH,
				reserveWINESToken,
				reserveSelectedTokenETH,
				reserveSelectedTokenToken,
				selectedTokenSymbol
			);
		},
		[
			allowanceWINES,
			balanceETH,
			balanceWINES,
			reserveWINESETH,
			reserveWINESToken,
			reserveSelectedTokenETH,
			reserveSelectedTokenToken,
			selectedTokenSymbol,
			refreshTrigger,
			state.count,
		]
	);

	async function transferShippingCosts(amount) {
		let signer = await ethers5Adapter.signer.toEthers({
			chain: base,
			client,
			account,
		});

		return signer.sendTransaction({
			to: ethers.utils.getAddress("0x2E54D912361f6A4b1e57E239138Ff4C1344940Ae"),

			value: amount,
		});
	}

	async function burn(amount) {
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
	}

	function openFarm() {
		setShowFarming(true);
	}

	function handleRedeemClick() {
		setState((state) => ({
			...state,
			visible: !state.visible,
			tradeType: TRADE_TYPES.REDEEM,
		}));
	}

	// --------------------------------------------------------------
	const [currentTransaction, _setCurrentTransaction] = useState({});
	const setCurrentTransaction = useCallback((hash, type, amount) => {
		_setCurrentTransaction({ hash, type, amount });
	}, []);
	const clearCurrentTransaction = useCallback(() => {
		_setCurrentTransaction({});
	}, []);

	const [showConnect, setShowConnect] = useState(false);
	const [showWorks, setShowWorks] = useState(false);

	const { t } = useTranslation();
	if (!state.tokenName)
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<BeatLoader
					color="#d68513"
					loading={true}
					cssOverride={{
						display: "flex",
						flexDirection: "row",
					}}
					size={40}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
			</div>
		);
	return (
		<>
			<Header wineryId={state.wineryId}>
				<Container>
					<CardWrapper>
						{state.tokenName !== "PDC19" &&
						state.tokenName !== "BCN24" &&
						state.tokenName !== "VARSI22" &&
						state.tokenName !== "TTTM25" ? (
							<div>
								<Farm onClick={openFarm}> {t("labels.farm")} </Farm>
								<Redeem onClick={handleRedeemClick}>
									{t("labels.redeem")}
								</Redeem>
							</div>
						) : (
							<></>
						)}
						<ImageContainer>
							<Image src={state.image} />
						</ImageContainer>
						<MarketData>
							<Title>
								{state.title} ({state.tokenName}){" "}
								<InfoIcon
									onClick={(e) => {
										e.preventDefault();
										setState((state) => ({
											...state,
											visible: !state.visible,
										}));
										setShowWorks(true);
									}}
								></InfoIcon>
							</Title>
							{state?.tokenName !== "PDC19" &&
							state?.tokenName !== "BCN24" &&
							state?.tokenName !== "VARSI22" &&
							state?.tokenName !== "TTTM25" ? (
								<>
									{isCrowdsale && !loadingPrice && (
										<CurrentPrice>
											{crowdsaleExchangeRateUSD
												? `$${amountFormatter(
														crowdsaleExchangeRateUSD,
														18,
														2
												  )} USDC`
												: "$0.00"}
										</CurrentPrice>
									)}
									{!isCrowdsale && (
										// !loadingPrice &&
										<CurrentPrice style={{ minHeight: "30px" }}>
											{state?.validationState && state?.validationState > 0 ? (
												<>
													{
														
														(priceRef.current = `$${amountFormatter(
															dollarize(state?.validationState),
															18,
															2
														)} USDC`)
													}
												</>
											) : (
												<BeatLoader
													color="#d68513"
													loading={true}
													cssOverride={{
														display: "flex",
														flexDirection: "row",
													}}
													size={25}
													aria-label="Loading Spinner"
													data-testid="loader"
												/>
											)}
										</CurrentPrice>
									)}
								</>
							) : state.tokenName === "PDC19" ? (
								<>
									<TokenIconContainer>
										<TokenIconText>
											{state?.tokenYear?.substring(2, 4)}
										</TokenIconText>
										<TokenIcon src={state.tokenIcon}></TokenIcon>
									</TokenIconContainer>
									<Countdown year={2025} month={5} day={1} />
								</>
							) : state.tokenName === "VARSI22" ? (
								<>
									<TokenIconContainer>
										<TokenIconText>
											{state?.tokenYear?.substring(2, 4)}
										</TokenIconText>
										<TokenIcon src={state.tokenIcon}></TokenIcon>
									</TokenIconContainer>
									<Countdown year={2025} month={5} day={6} />
								</>
							) : state.tokenName === "TTTM25" ? (
								<>
									<TokenIconContainer>
										<TokenIconText>
											{state?.tokenYear?.substring(2, 4)}
										</TokenIconText>
										<TokenIcon src={state.tokenIcon}></TokenIcon>
									</TokenIconContainer>
									<Countdown year={2025} month={5} day={6} />
								</>
							) : (
								<>
									<TokenIconContainer>
										<TokenIconText>
											{state?.tokenYear?.substring(2, 4)}
										</TokenIconText>
										<TokenIcon src={state.tokenIcon}></TokenIcon>
									</TokenIconContainer>
									<Countdown year={2025} month={6} day={1} hours={12} />
								</>
							)}

							{state?.tokenName !== "PDC19" &&
								state?.tokenName !== "BCN24" &&
								state?.tokenName !== "VARSI22" &&
								state?.tokenName !== "TTTM25" && (
									<>
										<TokenIconContainer>
											<TokenIconText>
												{state?.tokenYear?.substring(2, 4)}
											</TokenIconText>
											<TokenIcon src={state.tokenIcon}></TokenIcon>
										</TokenIconContainer>
										<TradeButtons
											balanceWINES={balanceWINES}
											isCrowdsale={isCrowdsale}
										></TradeButtons>
									</>
								)}
						</MarketData>
					</CardWrapper>

					<Checkout
						USDExchangeRateETH={USDExchangeRateETH}
						crowdsaleExchangeRateUSD={crowdsaleExchangeRateUSD}
						transferShippingCosts={transferShippingCosts}
						tokenSupply={tokenSupply}
						tokenCap={tokenCap}
						selectedTokenSymbol={selectedTokenSymbol}
						setSelectedTokenSymbol={setSelectedTokenSymbol}
						ready={ready}
						unlock={unlock}
						validateBuy={validateBuy}
						validateSell={validateSell}
						validateCrowdsale={validateCrowdsale}
						burn={burn}
						balanceWINES={balanceWINES}
						dollarPrice={dollarPrice}
						reserveWINESToken={reserveWINESToken}
						dollarize={dollarize}
						showConnect={showConnect}
						setShowConnect={setShowConnect}
						currentTransactionHash={currentTransaction.hash}
						currentTransactionType={currentTransaction.type}
						currentTransactionAmount={currentTransaction.amount}
						setCurrentTransaction={setCurrentTransaction}
						clearCurrentTransaction={clearCurrentTransaction}
						showWorks={showWorks}
						setShowWorks={setShowWorks}
						setRefreshTrigger={setRefreshTrigger}
						loadingPrice={loadingPrice}
						tokenName={state.tokenName}
					/>
					{showFarming && (
						<Farming
							setShowFarming={setShowFarming}
							tokenAddress={state.tokenAddress}
						></Farming>
					)}
				</Container>
			</Header>

			{state.wineryId === "costaflores" && (
				<div className={styles["product-content"]}>
					<Tabs />
					<Sensors />
				</div>
			)}
		</>
	);
}
