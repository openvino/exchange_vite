import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { client } from "../../config/thirdwebClient";
import { defineChain } from "thirdweb/chains";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
} from "thirdweb/react";
import axios from "axios";
import { useAppContext } from "../../context";
import { useTranslation } from "react-i18next";
import Button from "../shared/Button";
import {
  amountFormatter,
  closestIntegerDivisibleBy,
  USDToEth,
} from "../../utils";
import IncrementToken from "../shared/IncrementToken";
import { Close } from "@styled-icons/material/Close";
import Confetti from "react-dom-confetti";
import CheckImage from "../shared/CheckImage";
import RedeemForm from "../redeem/RedeemForm";
import { Circle, CheckCircle, Award } from "@styled-icons/boxicons-regular";
import { fetchRedeems, updateRedeem } from "../../utils/fetchRedeems";
import { BigNumber, ethers } from "ethers";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { getContract, prepareContractCall } from "thirdweb";
import ERC20 from "../../contracts/erc20.json";
import {
  getRedeemTemplateSuccess,
  getRedeemTemplateWithErrors,
} from "../../utils/emailTemplate";
import { getChain } from "../Main";
const config = {
  angle: 90,
  spread: 76,
  startVelocity: 51,
  elementCount: 154,
  dragFriction: 0.1,
  duration: 7000,
  stagger: 0,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
};

export function Controls({ closeCheckout, theme, type }) {
  const { t } = useTranslation();
  return (
    <FrameControls>
      <Unicorn theme={theme}>{t("labels.redeem")}</Unicorn>

      <CloseFrame onClick={() => closeCheckout()} alt="close"></CloseFrame>
    </FrameControls>
  );
}

export default function Redeem({
  USDExchangeRateETH,
  transferShippingCosts,
  balanceWINES,
  closeCheckout,
}) {
  const [state] = useAppContext();
  const [numberBurned, setNumberBurned] = useState();
  const [hasPickedAmount, setHasPickedAmount] = useState(false);
  const [hasConfirmedAddress, setHasConfirmedAddress] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [burnTxHash, setBurnTxHash] = useState("");
  const [lastTransactionHash, setLastTransactionHash] = useState("");
  const [hasBurnt, setHasBurnt] = useState(false);
  const [hasPaidShipping, setHasPaidShipping] = useState(false);
  const [userForm, setUserForm] = useState();
  const [shippingCost, setShippingCost] = useState();
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [redeem, setRedeem] = useState(0);
  const [shippingError, setShippingError] = useState(false);

  const { t } = useTranslation();

  const tokenContract = getContract({
    client,
    chain: getChain(),
    address: state.tokenAddress,
    abi: ERC20,
  });

  const library = ethers5Adapter.provider.toEthers({
    client,
    chain: getChain(),
  });

  const account = useActiveAccount();
  const pending = !!transactionHash;

  useEffect(() => {
    if (transactionHash) {
      library.waitForTransaction(transactionHash).then(() => {
        setLastTransactionHash(transactionHash);
        setTransactionHash("");

        if (!hasBurnt) {
          setHasBurnt(true);
        } else if (!hasPaidShipping) {
          setHasPaidShipping(true);
        }
      });
    }
  }, [transactionHash]);

  const sendEmailMessage = async (email, type) => {
    let body = {
      email: email,
      secret_key: import.meta.VITE_SECRET_KEY,
      subject: "",
      message: "",
    };
    if (type === "sucess") {
      body.subject = "Wine tokens redeemed - let’s plan your delivery 🍷";
      body.message = getRedeemTemplateSuccess(state.wineryRedeemEmail);
    }

    if (type === "error") {
      body.subject = "Wine tokens redeemed - shipping payment pending";
      body.message = getRedeemTemplateWithErrors(
        state.tokenName,
        state.wineryId,
        state.wineryRedeemEmail
      );
    }

    const message = await axios.post(
      `${import.meta.env.VITE_DASHBOARD_URL}/api/routes/emailRoute`,
      body
    );
    return message;
  };

  const handlePaidShipping = async (redeemToUpdate) => {
    setLoading(true);
    try {
      let res = await axios.get(
        `${
          import.meta.env.VITE_DASHBOARD_URL
        }/api/routes/shippingCostsRoute?token=${state.tokenName}&province_id=${
          redeemToUpdate.province_id
        }&amount=${redeemToUpdate.amount}`
      );

      let dollarCost;
      if (res.data) {
        dollarCost = BigNumber.from(res.data.cost * 100);
        setShippingCost(dollarCost);
      }

      const response = await transferShippingCosts(
        USDToEth(USDExchangeRateETH, dollarCost)
      );
      await response.wait();
      const updatedRedeem = await updateRedeem(
        `${state.apiUrl}/redeem/update`,
        { ...redeemToUpdate, shipping_tx_hash: response.hash }
      );
      const filteredRedeems = redeem.filter(
        (reed) => reed.burn_tx_hash !== redeemToUpdate.burn_tx_hash
      );
      setRedeem(filteredRedeems);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getRedeems = async () => {
    fetchRedeems(`${state.apiUrl}/redeem`);
    const redeems = await fetchRedeems(`${state.apiUrl}/redeem`);
    const filteredRedeems = redeems?.data.filter(
      (redeem) =>
        redeem.customer_id === account?.address &&
        redeem.shipping_paid_status === "false" &&
        redeem.pickup !== "true"
    );
    setRedeem(filteredRedeems);

    return filteredRedeems;
  };
  useEffect(() => {
    getRedeems();
  }, []);

  useEffect(() => {
    if (userForm?.pickup === false) {
      setSteps(2);
    } else {
      setSteps(1);
    }
  }, [userForm]);

  function link(hash) {
    return `https://basescan.org/tx/${hash}`;
  }

  function renderContent() {
    if (redeem.length >= 1 && !hasBurnt) {
      return (
        <>
          {" "}
          <div>
            <h2 style={{ padding: "10px", textAlign: "center" }}>
              {t("redeem.paidRedeem")}
            </h2>

            {redeem.map((item) => {
              return (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      justifyContent: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <p style={{ padding: "10px", textAlign: "center" }}>
                      {`${t("redeem.token")} : ${item.year}`}{" "}
                    </p>
                    <p style={{ padding: "10px", textAlign: "center" }}>
                      {`${t("redeem.amount")} : ${item.amount}`}{" "}
                    </p>
                    <button
                      onClick={() => handlePaidShipping(item)}
                      style={{
                        backgroundColor: "#D5841B",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Pagar ahora
                    </button>
                  </div>
                </>
              );
            })}
          </div>
          <ButtonFrame
            style={{ backgroundColor: "#D5841B", border: "none" }}
            onClick={() => setRedeem(0)}
            className="button"
            disabled={loading}
            pending={loading}
            text={
              loading ? t("wallet.waiting-confirmation") : `${t("redeem.omit")}`
            }
          />
        </>
      );
    } else if (state.redeemDate > new Date()) {
      return (
        <ConfirmContainer>
          <TopConfirmedFrame hasPickedAmount={hasPickedAmount}>
            <Controls closeCheckout={closeCheckout} type="shipping" />
          </TopConfirmedFrame>
          <ConfirmContent>
            <RedeemConfirmFrame hasPickedAmount={hasPickedAmount}>
              <ImgConfirmStyle
                src={state.image}
                alt="Logo"
                hasPickedAmount={hasPickedAmount}
              />
              <Divider></Divider>
              <Owned>
                <p style={{ fontWeight: "500", fontSize: "2rem" }}>
                  {state.title}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginTop: "16px",
                    color: "#ffffff",
                    opacity: 0.7,
                  }}
                >
                  {state.count}x Edition {state.tokenName}
                </p>
              </Owned>
            </RedeemConfirmFrame>
            <CheckoutConfirmPrompt>
              {t("wallet.redeem-message", {
                token: state.tokenName,
                date: state.redeemDate,
              })}
            </CheckoutConfirmPrompt>
          </ConfirmContent>
        </ConfirmContainer>
      );
    } else if (!account?.address) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          <ConnectButton
            client={client}
            chain={defineChain(getChain())}
            connectButton={{
              label: "Conectar Wallet",
              style: {
                marginTop: 20,
                background: "#d5841b",
                color: "white",
                fontSize: 20,
                boxShadow:
                  "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
              },
            }}
          />
        </div>
      );
    } else if (!hasPickedAmount) {
      return (
        <>
          <TopFrame hasPickedAmount={hasPickedAmount}>
            <Controls closeCheckout={closeCheckout} />
            <ImgStyle
              src={state.image}
              alt="Logo"
              hasPickedAmount={hasPickedAmount}
            />
            <InfoFrame $pending={pending.toString()}>
              <Owned>
                <WineCount>
                  {" "}
                  {t("wallet.you-own", {
                    amount:
                      balanceWINES && amountFormatter(balanceWINES, 18, 0),
                  })}
                </WineCount>
                <p>{t("wallet.redeem-token", { token: state.tokenName })}</p>
              </Owned>
              <IncrementToken
                // initialValue={closestIntegerDivisibleBy(Number(amountFormatter(balanceWINES, 18, 0)), 6)}
                initialValue={1}
                max={closestIntegerDivisibleBy(
                  Number(amountFormatter(balanceWINES, 18, 0)),
                  1
                )}
                step={1}
              />
            </InfoFrame>
            <ButtonFrame
              className="button"
              disabled={balanceWINES < 6}
              text={t("redeem.next")}
              type={"cta"}
              onClick={() => {
                setNumberBurned(state.count);
                setHasPickedAmount(true);
              }}
            />
          </TopFrame>
        </>
      );
    } else if (!hasConfirmedAddress) {
      return (
        <>
          <TopFrame hasPickedAmount={hasPickedAmount}>
            <Controls closeCheckout={closeCheckout} />
            <RedeemConfirmFrame hasPickedAmount={hasPickedAmount}>
              <ImgConfirmStyle
                src={state.image}
                alt="Logo"
                hasPickedAmount={hasPickedAmount}
              />
              <Divider></Divider>
              <Owned>
                <p style={{ fontWeight: "500", fontSize: "2rem" }}>
                  {state.title}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginTop: "16px",
                    color: "#ffffff",
                    opacity: 0.7,
                  }}
                >
                  {state.count}x Edition {state.tokenName}
                </p>
              </Owned>
            </RedeemConfirmFrame>
            <RedeemForm
              USDExchangeRateETH={USDExchangeRateETH}
              shippingCost={shippingCost}
              setShippingCost={setShippingCost}
              setUserForm={setUserForm}
              setHasConfirmedAddress={setHasConfirmedAddress}
              numberBurned={numberBurned}
            ></RedeemForm>
          </TopFrame>
        </>
      );
    } else if (!hasBurnt || !hasPaidShipping) {
      return (
        <>
          <TopFrame hasPickedAmount={hasPickedAmount}>
            <Controls closeCheckout={closeCheckout} type="confirm" />
            <RedeemConfirmFrame hasPickedAmount={hasPickedAmount}>
              <ImgConfirmStyle
                src={state.image}
                alt="Logo"
                hasPickedAmount={hasPickedAmount}
              />
              <Divider></Divider>
              <Owned>
                <p style={{ fontWeight: "500", fontSize: "2rem" }}>
                  {state.title}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginTop: "16px",
                    color: "#ffffff",
                    opacity: 0.7,
                  }}
                >
                  {state.count}x Edition {state.tokenName}
                </p>
              </Owned>
            </RedeemConfirmFrame>
            <RedeemSteps>
              <RedeemStepText>{t("redeem.noClose")}</RedeemStepText>
              <RedeemStep>
                {hasBurnt ? (
                  <CheckCircleIcon></CheckCircleIcon>
                ) : (
                  <CircleIcon></CircleIcon>
                )}
                <RedeemStepText
                  style={{ width: "30px" }}
                >{`1/${steps}`}</RedeemStepText>
                <RedeemStepText>
                  {t("redeem.burn")} {state.count}x {state.tokenName}
                </RedeemStepText>
              </RedeemStep>

              {!userForm?.pickup ? (
                <RedeemStep>
                  {hasPaidShipping ? (
                    <CheckCircleIcon></CheckCircleIcon>
                  ) : (
                    <CircleIcon></CircleIcon>
                  )}
                  <RedeemStepText
                    style={{ width: "30px" }}
                  >{`${steps}/${steps}`}</RedeemStepText>
                  <RedeemStepText>
                    {t("redeem.transfer-shipping-costs")}: $
                    {amountFormatter(shippingCost, 2, 2)} USD (
                    {amountFormatter(
                      USDToEth(USDExchangeRateETH, shippingCost),
                      18,
                      5
                    )}{" "}
                    ETH)
                  </RedeemStepText>
                </RedeemStep>
              ) : (
                <></>
              )}
            </RedeemSteps>

            {!hasBurnt && !shippingError && (
              <TransactionButton
                onTransactionConfirmed={async (response) => {
                  let shippingPaid = false;
                  let shippingTxHash = "";

                  setTransactionHash(response.transactionHash);
                  setBurnTxHash(response.transactionHash);

                  setHasBurnt(true);

                  if (userForm.pickup === false) {
                    try {
                      const transfer = await transferShippingCosts(
                        USDToEth(USDExchangeRateETH, shippingCost)
                      );

                      if (transfer.hash) {
                        console.log(transfer.hash);
                        shippingPaid = true;
                        shippingTxHash = transfer.hash;
                        setTransactionHash(transfer.hash);
                      }
                    } catch (error) {
                      setShippingError(true);
                      console.error(
                        "Shipping payment cancelled or failed:",
                        error
                      );
                    }
                  }

                  let body = {
                    public_key: account?.address,
                    name: userForm.name,
                    email: userForm.email,
                    amount: numberBurned,
                    year: state.tokenName,
                    street: userForm.line1,
                    number: userForm.line2,
                    country_id: userForm.country,
                    province_id: userForm.state,
                    zip: userForm.zip,
                    telegram_id: userForm.telegram,
                    signature: userForm.signature,
                    burn_tx_hash: response.transactionHash,
                    winerie_id: state.wineryId,
                    shipping_paid_status: shippingPaid.toString(),
                    pickup: userForm.pickup.toString(),
                    city: userForm.city,
                  };
                  await axios.post(`${state.apiUrl}/redeem`, body);
                  if (shippingPaid) {
                    console.log("enviando success");
                    sendEmailMessage(userForm.email, "sucess");
                  } else {
                    console.log("enviando error");
                    sendEmailMessage(userForm.email, "error");
                  }
                }}
                transaction={() =>
                  prepareContractCall({
                    contract: tokenContract,
                    method: "burn",
                    params: [
                      ethers.utils.parseUnits(numberBurned.toString(), 18),
                    ],
                  })
                }
              >
                {loading
                  ? t("wallet.waiting-confirmation")
                  : `${t("redeem.burn")} ${state.tokenName}`}
              </TransactionButton>
            )}

            {hasBurnt && shippingError && (
              <button
                onClick={async () => {
                  try {
                    const redeemFilter = await getRedeems();
                    const matchRedeem = redeemFilter?.filter(
                      (item) => item.burn_tx_hash === burnTxHash
                    );

                    const response = await transferShippingCosts(
                      USDToEth(USDExchangeRateETH, shippingCost)
                    );

                    if (response.hash) {
                      //actualizar el redeem para que pase a true
                      await updateRedeem(`${state.apiUrl}/redeem/update`, {
                        ...matchRedeem[0],
                        shipping_tx_hash: response.hash,
                      });

                      setHasPaidShipping(true);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }}
              >
                {t("redeem.try-again")}{" "}
              </button>
            )}

            <Back disabled={!!pending}>
              {pending ? (
                <EtherscanLink
                  href={link(transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("wallet.view-etherscan")}
                </EtherscanLink>
              ) : (
                <span
                  onClick={() => {
                    setHasConfirmedAddress(false);
                  }}
                >
                  back
                </span>
              )}
            </Back>
          </TopFrame>
        </>
      );
    } else {
      return (
        <>
          <TopFrame hasPickedAmount={hasPickedAmount}>
            <Controls closeCheckout={closeCheckout} />
            <CheckImage></CheckImage>
            <InfoFrame>
              <Owned>
                <p style={{ fontSize: "18px" }}>{t("redeem.you-got-wine")}</p>
              </Owned>
            </InfoFrame>
            <CheckoutPrompt>{t("redeem.estimated-time")}</CheckoutPrompt>
            <div style={{ margin: "16px 0 16px 16px" }}>
              <EtherscanLink
                href={link(lastTransactionHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("wallet.view-etherscan")}
              </EtherscanLink>
            </div>
          </TopFrame>
        </>
      );
    }
  }

  return (
    <>
      {renderContent()}
      {hasBurnt && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Confetti active={hasBurnt} config={config} />
        </div>
      )}
    </>
  );
}

const TopFrame = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #141414;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
`;

const TopConfirmedFrame = styled.div`
  width: 100%;
  background: #141414;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
`;

const ConfirmContainer = styled.div`
  height: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const ConfirmContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 1rem;
`;

const FrameControls = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const Unicorn = styled.p`
  color: ${(props) => (props.theme === "dark" ? "#000" : "#fff")};
  font-weight: 600;
  margin: 0px;
  font-size: 16px;
`;

const CloseFrame = styled(Close)`
  width: 25px;
  color: #fff;
  font-weight: 600;
  margin: 0px;
  /* margin-right: 2px;
  margin-top: -7px; */
  height: 25px;
  font-size: 16px;
  padding: 4px;
  cursor: pointer;
`;

const InfoFrame = styled.div`
  opacity: ${(props) => (props.$pending ? 0.6 : 1)};
  width: 100%;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: ${(props) =>
    props.hasPickedAmount ? "space-around" : "space-between"};
  align-items: center;
  padding: 1rem;

  border-radius: 6px;

  background-color: #1e1f21;
  box-sizing: border-box;
`;

const RedeemConfirmFrame = styled.div`
  opacity: ${(props) => (props.pending ? 0.6 : 1)};
  width: 100%;
  height: 160px;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding: 1rem;

  border-radius: 6px;

  background-color: #1e1f21;
  box-sizing: border-box;
`;

const Owned = styled.div`
  font-weight: 700;
  color: #efe7e4;
  font-size: 24px;
  margin-bottom: 12px;
  margin: 0px;
  white-space: pre-wrap;
`;

const Bonus = styled.div`
  font-weight: 500;
  font-size: 12px;
  padding: 4px;
  background-color: var(--uniswap-primary):
  border-radius: 4px;
  position: absolute;
  top: 200px;
  left: 32px;
`;

const ImgStyle = styled.img`
  max-width: ${(props) =>
    props.hasPickedAmount ? (props.hasBurnt ? "300px" : "120px") : "300px"};
  height: auto;
  max-height: calc(100vh - 250px);
  padding: ${(props) =>
    props.hasPickedAmount
      ? props.hasBurnt
        ? "0px"
        : "0 1rem 0 0"
      : "2rem 0 2rem 0"};
  box-sizing: border-box;
`;

const ImgConfirmStyle = styled.img`
  height: 100%;
  box-sizing: border-box;
`;

const WineCount = styled.span`
  color: #aeaeae;
  font-weight: 400;
  font-size: 14px;
  width: 100%;
  margin-bottom: 0.5rem;
  color: var(--uniswap-primary):
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;

const Back = styled.div`
  color: #aeaeae;
  font-weight: 400;
  margin: 0px;
  margin: -4px 0 16px 0px !important;
  font-size: 14px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* color: var(--uniswap-primary): */
  text-align: center;
  span {
    cursor: pointer;
  }
  span:hover {
    text-decoration: underline;
  }
`;

const CheckoutPrompt = styled.p`
  font-weight: 500;
  font-size: 14px;
  padding: 16px 0;
  text-align: left;
  color: "#000";
  font-style: italic;
  width: 100%;
`;

const ButtonFrame = styled(Button)`
  height: 48px;
  padding: 16px;
  margin: 16px;
  width: calc(100% - 32px);
`;

const EtherscanLink = styled.a`
  text-decoration: none;
  color: var(--uniswap-primary):
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
`;
const Divider = styled.div`
  width: 1px;
  height: 80%;
  background-color: #979797;
  margin: 0 2rem;
`;
const CheckoutConfirmPrompt = styled.div`
  color: white;
  line-height: 1.73;
  letter-spacing: 1.46px;
  font-size: 1rem;
  font-weight: 300;
  padding: 16px;
`;
const RedeemSteps = styled.div`
  padding: 16px 16px 16px 0;
  flex: 1;
`;
const RedeemStep = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 16px 0;
`;
const RedeemStepText = styled.p`
  margin: 0px;
  font-size: 14px;
  font-weight: 500;
  padding: 0 5px;
`;
const CircleIcon = styled(Circle)`
  height: 28px;
  width: 28px;
`;
const CheckCircleIcon = styled(CheckCircle)`
  height: 28px;
  width: 28px;
`;
