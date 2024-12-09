import React, { useEffect, useState } from "react";
import Header from ".././Header/Header";
import styled from "styled-components";
import Button from "../shared/Button";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../../config/thirdwebClient";
import { baseSepolia } from "thirdweb/chains";
import ERC20ABI from '../../contracts/erc20.json';
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { getContract } from "../../utils";
import { ethers } from "ethers";
export default function Bridge() {
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [error, setError] = useState("");
  const [balances, setBalances] = useState([]);
  const [showBalances, setShowBalances] = useState(false);

  const tokensMatch = [
    { id: "TB24", address: "0xA6a8baf59C58962a0A1a82e8fF8dcfE3f7aAcF9A" },
    { id: "MTB18", address: "0xc0CcF602398f03a673C8723065Ff2D5DEC1cE92e" },
    { id: "MTB19", address: "0x5BA286e5399DBF6626A32334E3c5B8697ca15548" },
  ];

  const account = useActiveAccount();

  const library = ethers5Adapter.provider.toEthers({
    client,
    chain: baseSepolia,
  });

  const fetchBalances = async () => {
    try {
      const balances = await Promise.all(
        tokensMatch.map(async (token) => {
          const contract = getContract(token.address, ERC20ABI, library);
          const balance = await contract.balanceOf(account.address);
          const decimals = await contract.decimals();
          return {
            id: token.id,
            address: token.address,
            balance: balance / 10 ** decimals,
          };
        })
      );

      const validBalances = balances.filter((token) => token.balance > 0);

      if (validBalances.length === 0) {
        setError("No tienes tokens con balance suficiente para migrar");
        setTimeout(() => setError(false), 5000);
        return;
      }

      setBalances(validBalances);
      setShowBalances(true);
    } catch (err) {
      console.error("Error al consultar balances:", err);
      setError("Hubo un problema al consultar los balances");
      setTimeout(() => setError(false), 5000);
    }
  };

  const handleMigration = async () => {
    try {
      const signer = await ethers5Adapter.signer.toEthers({
        client: client,
        chain: baseSepolia,
        account: account,
      });

      for (const token of balances) {
        const contract = getContract(token.address, ERC20ABI, library);
        const amount = ethers.utils.parseUnits(token.balance.toString(), 18);
        console.log(`Transferencia de ${amount} de ${token.id}`);

        const tx = await contract.connect(signer).transfer("0x588CAf4a036137647daCE2eE2699a85931967A7d", amount);
        console.log(`Transferencia enviada. Tx Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`Transferencia confirmada.`);
      }

      alert("Todos los tokens han sido transferidos con éxito.");
    } catch (err) {
      console.error("Error al transferir tokens:", err);
      setError("Hubo un problema al transferir los tokens");
      setTimeout(() => setError(false), 5000);
    }
  };

  return (
    <Header>
      <Container>
        <CardWrapper>
          <MarketData>
            <Title>Migra tus tokens de mainnet a Base</Title>
            <SubTitle>Completa el formulario</SubTitle>
            <ConnectButton client={client} chain={baseSepolia} />
            <form>
              {error && <Error>{error}</Error>}
              <FormInput value={walletAddress} placeholder="Dirección de wallet" type="text" onChange={(e) => setWalletAddress(e.target.value)} />
              <FormInput value={email} placeholder="Email" type="text" onChange={(e) => setEmail(e.target.value)} />
              <FormInput value={telegram} placeholder="Telegram" type="text" onChange={(e) => setTelegram(e.target.value)} />

              <ButtonFrame text="Verificar Balances" onClick={fetchBalances} />
              {showBalances && (
                <BalancesList>
                  {balances.map((token) => (
                    <p key={token.id}>
                      {token.id}: {token.balance.toFixed(4)}
                    </p>
                  ))}
                  <ButtonFrame text="Migrar" onClick={handleMigration} />
                </BalancesList>
              )}
            </form>
          </MarketData>
        </CardWrapper>
      </Container>
    </Header>
  );
}


const BalancesList = styled.div`
  margin: 16px 0;
 
  p {
    color: white;
    font-size: 14px;
  }
`;


const Error = styled.p`
  color: red;
  margin: 12px 0px;
  text-align: center;
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

const Container = styled.div`
  height:100%;
  display: flex;
  align-items: center;
  justify-content: center;
    width: 100%;
    margin-top: 120px;
`;