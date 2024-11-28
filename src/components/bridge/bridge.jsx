import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { axiosClient } from "../../config/axiosClient";
import Header from ".././Header/Header";
import styled from "styled-components";
import Button from "../shared/Button";
import { ConnectButton } from "thirdweb/react";
import { client } from "../../config/thirdwebClient";
import { ethereum } from "thirdweb/chains";
export default function Bridge({ key, setKey }) {
    const { wineryId, productId } = useParams();
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState("");

    const getProductList = async () => {
        try {
            const { data } = await axiosClient.get("/token", {
                params: { winerie_id: wineryId },
            });
            console.log(data);

            setTokens(data); // Asegúrate de que la respuesta tenga esta estructura
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    };

    useEffect(() => {
        getProductList();
    }, [productId, wineryId]);




    const handleTokenSelect = (tokenId) => {
        setSelectedToken(tokenId);
    };

    return (
        <Header>
            <Container>
                <CardWrapper>
                    <MarketData>
                        <Title>
                            Migra tus tokens de mainnet a Base
                        </Title>
                        <SubTitle>
                            Completa el formulario
                        </SubTitle>
                        <ConnectButton client={client} chain={ethereum} />
                        <form>
                            <FormInput placeholder="Dirección de wallet" type="text" />
                            <FormInput placeholder="Email" type="text" />
                            <FormInput placeholder="Telegram" type="text" />

                            {/* Lista para los tokens */}
                            <TokenListWrapper>
                                <p style={{ textAlign: "center" }}>Selecciona un token</p>
                                <TokenList>
                                    {tokens.map((token) => (
                                        <TokenItem
                                            key={token.id}
                                            onClick={() => handleTokenSelect(token.id)}
                                            selected={token.id === selectedToken}
                                        >
                                            <TokenImage src={token.token_icon} alt={token.name} />
                                            <TokenInfo>
                                                <span>{token.name}</span>
                                                <span>{token.amount}</span>
                                            </TokenInfo>
                                        </TokenItem>
                                    ))}
                                </TokenList>
                            </TokenListWrapper>
                            {selectedToken && <AvailableTokens>
                                <p> Disponible: 30 tokens {selectedToken}</p>
                            </AvailableTokens>}
                            <ButtonFrame text="Migrar" />
                        </form>
                    </MarketData>
                </CardWrapper>
            </Container>
        </Header>
    );
}


const AvailableTokens = styled.div`
  display: flex;    
  flex-direction: row;    
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;
const CardWrapper = styled.div`
max-width: 750px;
  width: 100%;
  height: 100%;
  background: #141414;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  color: #f1ede2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: default;
  padding: 32px 32px 16px 32px;
  z-index: 1;
  transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);
  box-sizing: border-box;

  @media only screen and (max-width: 480px) {
    /* For mobile phones: */
    // flex-direction: column;
  }
`;

const Title = styled.h2`
  font-weight: 500;
  font-size: 24px;
  line-height: 126.7%;
  margin: 0;
  color: #ffff;    
  text-align: center;
  margin-bottom: 16px;
`;

const SubTitle = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 126.7%;
  margin: 0;
  color: #ffff;    
  text-align: center;
  margin-bottom: 16px;
`;

const MarketData = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormInput = styled.input`
   width: 100%;
  padding: 12px 20px;
  font-size: 0.8em;
  margin: 8px 0;
  box-sizing: border-box;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background-color: transparent;
  color: white;
  outline: none;
`;

const ButtonFrame = styled(Button)`
  height: 48px;
  padding: 16px;
  margin: 16px;
  width: calc(100% - 32px);
`;

const TokenListWrapper = styled.div`
  width: 100%;
  margin: 16px 0;
`;

const TokenList = styled.div`
  display: flex;
justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TokenItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${({ selected }) => (selected ? "#b3e5fc" : "rgba(255, 255, 255, 0.3)")};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(179, 229, 252, 0.5);
  }
`;

const TokenImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: 0.9em;
    color: black;
  }
`;

const Container = styled.div`
  height:100%;
  display: flex;
  align-items: center;
  justify-content: center;
    width: 100%;
    margin-top: 120px;
`;