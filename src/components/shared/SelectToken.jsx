import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { currenciesNames } from "../../utils";
import { fetchPrice } from "../../utils/fetchPrice";

const CURRENCY_IMAGES = {
  ETH: "/images/currencies_img/ethereum-eth-logo.png",
  USDC: "/images/currencies_img/usd-coin-usdc-logo.png",
  ARS: "/images/currencies_img/ars.svg",
  EURS: "/images/currencies_img/eur.png",
  BRL: "/images/currencies_img/brs.svg",
  CLP: "/images/currencies_img/chl.svg",
  COP: "/images/currencies_img/colom.svg",
};

export default function SelectToken({ prefix, defaultCurrency = "USDC" }) {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [changeRate, setChangeRate] = useState(null);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const numericPrefix = Number(prefix);
  const safePrefix = Number.isFinite(numericPrefix) ? numericPrefix : 0;
  const convertedValue = safePrefix * Number(changeRate ?? 0);
  const displayValue =
    selectedCurrency === "ETH"
      ? convertedValue.toFixed(6)
      : convertedValue.toFixed(2);

  useEffect(() => {
    let cancelled = false;
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      const toCurrency =
        selectedCurrency === "USD"
          ? "DAI"
          : selectedCurrency === "EURS"
          ? "EUR"
          : selectedCurrency;
      const rate = await fetchPrice("ETH", toCurrency);
      if (!cancelled) {
        setChangeRate(rate);
        setIsLoadingRate(false);
      }
    };
    fetchExchangeRate();
    return () => { cancelled = true; };
  }, [selectedCurrency]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Wrapper ref={containerRef}>
      <Trigger onClick={() => setIsOpen((o) => !o)}>
        <CurrencyLogo
          src={CURRENCY_IMAGES[selectedCurrency]}
          alt={selectedCurrency}
        />
        <AmountText>
          {isLoadingRate ? (
            <SpinnerDot />
          ) : (
            `${displayValue} ${selectedCurrency}`
          )}
        </AmountText>
        <Chevron $open={isOpen}>▾</Chevron>
      </Trigger>

      {isOpen && (
        <Dropdown>
          {currenciesNames.map((currency) => (
            <DropdownOption
              key={currency}
              $active={currency === selectedCurrency}
              onClick={() => {
                setSelectedCurrency(currency);
                setIsOpen(false);
              }}
            >
              <CurrencyLogo
                src={CURRENCY_IMAGES[currency]}
                alt={currency}
              />
              <OptionText>
                <OptionCode>{currency}</OptionCode>
                <OptionLabel>{t(`currencies.${currency}`)}</OptionLabel>
              </OptionText>
            </DropdownOption>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  padding: 6px 12px 6px 8px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AmountText = styled.span`
  white-space: nowrap;
`;

const Chevron = styled.span`
  font-size: 12px;
  opacity: 0.6;
  transition: transform 0.2s ease;
  transform: ${(p) => (p.$open ? "rotate(180deg)" : "rotate(0deg)")};
`;

const CurrencyLogo = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: #1e1f21;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const DropdownOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  background: ${(p) =>
    p.$active ? "rgba(213, 132, 27, 0.15)" : "transparent"};
  border: 1px solid
    ${(p) => (p.$active ? "rgba(213, 132, 27, 0.4)" : "transparent")};

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionCode = styled.span`
  color: #fff;
  font-size: 13px;
  font-weight: 600;
`;

const OptionLabel = styled.span`
  color: #aeaeae;
  font-size: 11px;
`;

const SpinnerDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
