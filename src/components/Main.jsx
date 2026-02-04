import React, { useEffect, useState, useCallback, useMemo } from "react";
import Checkout from "./checkout/Checkout";
import BeatLoader from "react-spinners/BeatLoader";
import { useAppContext } from "../context";
import { TradeButtons } from "./shared/TradeButtons";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { client } from "../config/thirdwebClient";
import { base, baseSepolia } from "thirdweb/chains";
import styles from "./Header/Header.module.css";
import { TOKEN_SYMBOLS, TRADE_TYPES, amountFormatter } from "../utils";
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
import { APIURL, DEV_MODE, WETH_ADDRESS } from "../config";
import useUsdPricing from "../hooks/useUsdPricing";
import useCrowdsaleInfo from "../hooks/useCrowdsaleInfo";
import useTradingReady from "../hooks/useTradingReady";
import useOneBottlePrice from "../hooks/useOneBottlePrice";
import useTradeValidators from "../hooks/useTradeValidators";
import useTradingActions from "../hooks/useTradingActions";
import { dollarize as dollarizeAmount } from "../features/trading/lib/formatters";
import { getChain } from "../utils/getChain";

export default function Main() {
  const chain = useMemo(() => getChain(), []);
  const library = useMemo(() => {
    return ethers5Adapter.provider.toEthers({
      client,
      chain,
    });
  }, [client, chain]);
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

  const ready = useTradingReady({
    isCrowdsale,
    tokenSupply,
    accountAddress: account?.address ?? null,
    allowanceWINES,
    allowanceSelectedToken,
    balanceETH,
    balanceWINES,
    balanceSelectedToken,
    reserveWINESETH,
    reserveWINESToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
    selectedTokenSymbol,
    usdExchangeRateETH,
    usdExchangeRateSelectedToken,
  });

  const oneBottleValidation = useOneBottlePrice({
    allowanceSelectedToken,
    balanceETH,
    balanceSelectedToken,
    reserveWINESETH,
    reserveWINESToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
    selectedTokenSymbol,
  });

  const { unlock, transferShippingCosts, burn } = useTradingActions({
    account,
    chain,
    client,
    library,
    routerContract,
    exchangeContractSelectedToken,
    tokenContractWINES,
    selectedTokenSymbol,
  });

  const { validateBuy, validateSell, validateCrowdsale } = useTradeValidators({
    allowanceSelectedToken,
    allowanceWINES,
    balanceETH,
    balanceWINES,
    balanceSelectedToken,
    reserveWINESETH,
    reserveWINESToken,
    reserveSelectedTokenETH,
    reserveSelectedTokenToken,
    selectedTokenSymbol,
    crowdsaleExchangeRateETH,
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

  const dollarize = useCallback(
    (amount) =>
      dollarizeAmount(
        amount,
        selectedTokenSymbol === TOKEN_SYMBOLS.ETH
          ? usdExchangeRateETH
          : usdExchangeRateSelectedToken
      ),
    [selectedTokenSymbol, usdExchangeRateETH, usdExchangeRateSelectedToken]
  );

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
  const oneBottlePrice = oneBottleValidation?.inputValue;

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
                    {oneBottlePrice &&
                    state?.validationState &&
                    state?.validationState > 0 ? (
                      <>
                        {`$${amountFormatter(
                          dollarize(oneBottlePrice),
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
            USDExchangeRateETH={usdExchangeRateETH}
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
