import React, { useEffect, useState, useCallback, useMemo } from "react";
import Checkout from "./checkout/Checkout";
import BeatLoader from "react-spinners/BeatLoader";
import { useAppContext } from "../context";
import { TradeButtons } from "./shared/TradeButtons";
import { BigNumber, ethers } from "ethers";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { client } from "../config/thirdwebClient";
import { base, baseSepolia } from "thirdweb/chains";
import styles from "./Header/Header.module.css";
import {
  TOKEN_SYMBOLS,
  TRADE_TYPES,
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
import Header from "./Header/Header";
import Tabs from "./Tabs/Tabs";
import Sensors from "./Sensors/Sensors";
import { useAllBalances } from "../hooks";
import { useContracts } from "../hooks";
import useProductDetails from "../hooks/useProductDetails";
import { APIURL, DEV_MODE, SHIPPING_ADDRESS, WETH_ADDRESS } from "../config";
import useUsdPricing from "../hooks/useUsdPricing";
import useCrowdsaleInfo from "../hooks/useCrowdsaleInfo";

export const getChain = () => {
  const productionMode = DEV_MODE === "production";
  if (productionMode) {
    return base;
  } else {
    return baseSepolia;
  }
};

export default function Main() {
  const library = useMemo(() => {
    return ethers5Adapter.provider.toEthers({
      client,
      chain: getChain(),
    });
  }, [client]);
  // selected token
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(
    TOKEN_SYMBOLS.ETH
  );

  const account = useActiveAccount();
  const { wineryId, productId } = useParams();
  const [state, setState] = useAppContext();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // estado para controlar el loader temporal
  const [showLoadingTimed, setShowLoadingTimed] = useState(false);

  const {
    tokenContractWINES,
    exchangeContractSelectedToken,
    routerContract,
    pairMTBwETH,
    crowdsaleContract,
  } = useContracts(state?.tokenAddress, state?.crowdsaleAddress);

  const {
    data: { product, winery, images, pairAddress },
    loading: isFetchingProduct,
    error: productError,
  } = useProductDetails({ wineryId, productId });

  const { reserves, token0, token1 } = useReserves(pairMTBwETH);

  const reserveWINESETH =
    token0 === WETH_ADDRESS ? reserves.reserve0 : reserves.reserve1;
  const reserveWINESToken =
    token1 === state.tokenAddress ? reserves.reserve1 : reserves.reserve0;

  const [showFarming, setShowFarming] = useState(false);

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

  // get balances
  const {
    balanceETH,
    balanceWINES,
    balanceSelectedToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
  } = useAllBalances(
    account?.address,
    state?.tokenAddress,
    selectedTokenSymbol,
    refreshTrigger
  );

  const {
    usdExchangeRateETH,
    usdExchangeRateSelectedToken,
    poolDollarPrice,
    loading: loadingPrice,
  } = useUsdPricing({
    selectedTokenSymbol,
    reserveWINESETH,
    reserveWINESToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
  });

  const {
    isCrowdsale,
    exchangeRateEth: crowdsaleExchangeRateETH,
    exchangeRateUsd: crowdsaleExchangeRateUSD,
  } = useCrowdsaleInfo({
    crowdsaleContract,
    crowdsaleAddress: state?.crowdsaleAddress,
    usdExchangeRateETH,
  });

  useEffect(() => {
    if (product?.id && winery && images) {
      setState((state) => ({
        ...state,
        apiUrl: APIURL,
        crowdsaleAddress: product.crow_sale_address,
        wineryId: product.WinerieID || "",
        tokenAddress: product.token_address,
        image: images.bottleUrl || "",
        tokenYear: product.year.toString(),
        tokenName: product.id,
        tokenIcon: images.tokenUrl,
        title: "Token",
        shippingAccount: product.shipping_account,
        validationState: undefined,
        loading: true,
        wineryEmail: winery.email || "",
        wineryRedeemEmail: winery.email_redeem,
        redeemDate: product.redeem_date,
        pairNotInitialized: pairAddress ? false : true,
      }));
    }
  }, [product, winery, images, pairAddress]);

  useEffect(() => {
    if (state?.pairNotInitialized) {
      setShowLoadingTimed(true);
      const timer = setTimeout(() => {
        setShowLoadingTimed(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state?.pairNotInitialized]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setState((state) => ({ ...state, visible: false }));
  }, []);

  const ready = !!(
    (isCrowdsale && tokenSupply > 6) ||
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
      (usdExchangeRateETH || usdExchangeRateSelectedToken))
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
        ? usdExchangeRateETH
        : usdExchangeRateSelectedToken
    );
  }

  async function unlock(buyingWINES = true) {
    const contract = buyingWINES
      ? tokenContractSelectedToken
      : tokenContractWINES;
    const spenderAddress = buyingWINES
      ? exchangeContractSelectedToken.address
      : routerContract.address;
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
        selectedTokenSymbol,
        usdExchangeRateETH
      );
    },
    [
      allowanceSelectedToken,
      balanceETH,
      balanceSelectedToken,
      crowdsaleExchangeRateETH,
      selectedTokenSymbol,
      usdExchangeRateETH,
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
      chain: getChain(),
      client,
      account,
    });

    return signer.sendTransaction({
      to: ethers.utils.getAddress(SHIPPING_ADDRESS),
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
  if (!state.tokenName && loadingPrice)
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

  // ONE BOTTLE PRICE
  const { inputValue } = validateBuy("1");

  return (
    <>
      <Header wineryId={state.wineryId}>
        <Container>
          <CardWrapper>
            <div>
              <Farm onClick={openFarm}> {t("labels.farm")} </Farm>
              <Redeem onClick={handleRedeemClick}>{t("labels.redeem")}</Redeem>
            </div>

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
                {!isCrowdsale && !state?.pairNotInitialized && (
                  <CurrentPrice style={{ minHeight: "30px" }}>
                    {inputValue &&
                    state?.validationState &&
                    state?.validationState > 0 ? (
                      <>
                        {`$${amountFormatter(
                          dollarize(inputValue),
                          18,
                          2
                        )} USDC`}
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
                {!isCrowdsale &&
                  state?.pairNotInitialized &&
                  (showLoadingTimed ? (
                    <BeatLoader
                      color="#d68513"
                      loading={true}
                      cssOverride={{ display: "flex", flexDirection: "row" }}
                      size={25}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : (
                    <CurrentPrice style={{ minHeight: "30px" }}>
                      {t("TEMP_NOT_AVAILABLE")}
                    </CurrentPrice>
                  ))}
              </>

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
            </MarketData>
          </CardWrapper>

          <Checkout
            usdExchangeRateETH={usdExchangeRateETH}
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
            dollarPrice={poolDollarPrice}
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
