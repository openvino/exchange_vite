import React, { useEffect } from "react";

import styled from "styled-components";

import { Close } from "@styled-icons/material/Close";

import { Trans, useTranslation } from "react-i18next";

import { useAppContext } from "../../context";
import { tokensInfo } from "../../entities";
const WorksFrame = styled.div`
	width: 100%;
	min-height: 100vh;
	min-height: 100svh;
	padding: 16px 32px;
	box-sizing: border-box;
	font-size: 24px;
	font-weight: 600;
	max-height: 80vh;
	overflow-y: scroll;

	display: flex;
	flex-direction: column;
`;
const Title = styled.p`
	margin-top: 1rem !important;
	font-weight: 700;
	font-size: 20px;
`;

const Desc = styled.p`
	line-height: 150%;
	font-size: 14px;
	margin-top: 1rem !important;
	font-weight: 500;

	a {
		color: white;
		text-decoration: underline;
	}
`;

const DbDesc = styled.div`
	font-size: 14px;
	font-weight: 500;
	line-height: 150%;
	margin-top: 1rem;

	p {
		margin-top: 1rem !important;
	}

	p:first-child {
		margin-top: 0 !important;
	}

	p strong {
		font-weight: 700;
		font-size: 18px;
	}

	a {
		color: white;
		text-decoration: underline;
	}

	ul {
		list-style: disc;
		padding-left: 1.25em;
		margin-top: 1rem;
	}
`;

export const EtherscanLink = styled.a`
  text-decoration: none;
  color: var(--uniswap-primary):
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
`;

export default function Works({ tokenSupply, closeCheckout, tokenName }) {
	const [state] = useAppContext();
	const tokenData = tokensInfo[tokenName];
	const { t, i18n } = useTranslation();

	const dbDescription = (() => {
		if (!state.tokenDescription) return null;
		try {
			const parsed = JSON.parse(state.tokenDescription);
			return parsed[i18n.language] || parsed['es'] || null;
		} catch {
			return state.tokenDescription.replace(/\n/g, '<br>');
		}
	})();

	const commonDescription = (() => {
		if (!state.commonDescription) return null;
		try {
			const parsed = typeof state.commonDescription === 'string'
				? JSON.parse(state.commonDescription)
				: state.commonDescription;
			return parsed[i18n.language] || parsed['es'] || null;
		} catch {
			return null;
		}
	})();

	const redeemDate = state.redeemDate || tokenData?.redeemDate;

	return (
		<WorksFrame>
			<CloseFrame onClick={() => closeCheckout()} alt="close"></CloseFrame>

			<Title>{t("info.1")}</Title>

			{dbDescription ? (
				<DbDesc dangerouslySetInnerHTML={{ __html: dbDescription }} />
			) : (
				<>
					{tokenData && (
						<Desc>
							<Trans
								i18nKey="info.2"
								values={{
									token: state.tokenName,
									year: state.tokenYear,
									description: tokenData.fullDescription,
								}}
								components={[
									<a
										href={tokenData.wineryUrl}
										style={{ color: "white", "text-decoration": "underline" }}
										key={state.tokenName + "info.2"}
										target="_blank"
									>
										{state.wineryId}
									</a>,
								]}
							/>
						</Desc>
					)}
					<Desc>
						<Trans
							i18nKey="info.3"
							components={[
								<a
									href="https://www.youtube.com/watch?v=7ZYISUzJBMo&feature=youtu.be"
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: "white", "text-decoration": "underline" }}
									key={state.tokenName + "info.3"}
								>
									{" "}
									here{" "}
								</a>,
								<a
									href="https://www.youtube.com/watch?v=GvhYdOVTmlM&feature=youtu.be"
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: "white", "text-decoration": "underline" }}
									key={state.tokenName + "info.3.2"}
								>
									{" "}
									Openvino{" "}
								</a>,
							]}
						/>
					</Desc>
					<Desc>
						<Trans
							i18nKey="info.4"
							values={{
								date: redeemDate,
								token: state.tokenName,
							}}
						/>
					</Desc>
				</>
			)}
			{commonDescription && (
				<DbDesc dangerouslySetInnerHTML={{ __html: commonDescription }} />
			)}
		</WorksFrame>
	);
}

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
	align-self: flex-end;
	position: absolute;
`;
