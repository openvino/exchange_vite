import { WETH_ADDRESS as WETH } from "../config";

// TODO fetch whitelisted pools from db
const WETH_ADDRESS = WETH;
export const whitelistedPools = [
	// BASE SEPOLIA

	//MTB18
	{
		address: "0xdDeC9C61cC526e79fb686d12be00577853E358Be",
		pair: ["0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23", WETH_ADDRESS],
	},
	//MTB19
	{
		address: "0x07aA6e8fef4A368D111040B2bF5dD570b75a2781",
		pair: ["0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF", WETH_ADDRESS],
	},
	//MTB20
	{
		address: "0xe497383530ffDD92c1caF7a6072C384E0131D7ef",
		pair: ["0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F", WETH_ADDRESS],
	},
	//MTB21
	{
		address: "0x4c2871bc115c01Fb05EE95d377EA67F159f148Fa",
		pair: ["0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f", WETH_ADDRESS],
	},
	//MTB22
	{
		address: "0x6Ed45D02A70C116b6aE9f0A928474D4c41B1AFb7",
		pair: ["0xeF89072a1f25c2aDA952c2e04644289906e0e6F9", WETH_ADDRESS],
	},
	//MTB23
	{
		address: "0xAc826B4901F92e910EA829D64A49BB624A41c548",
		pair: ["0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820", WETH_ADDRESS],
	},
	//MTB24
	{
		address: "0xf8f0d8F21Be23E97cE7524656Cb6326e5582609A",
		pair: ["0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe", WETH_ADDRESS],
	},

	//TTS BASE SEPOLIA 
	{
		address: "0x4b1BF598d304E754803Ca94c46C0c36493a36400",
		pair: ["0x071D5a0F460211BcfEa4fA6354f22A272dc7547D", WETH_ADDRESS],
	}
	
];

export const getPairAddress = (pair) => {
	const filteredPair = whitelistedPools.find(
		(p) =>
			(p.pair[0] === pair[0] && p.pair[1] === pair[1]) ||
			(p.pair[0] === pair[1] && p.pair[1] === pair[0])
	);

	return filteredPair?.address || null;
};
export const getPairAddressFromTokenAddress = (tokenAddress) => {
	const pair = [tokenAddress, WETH_ADDRESS];
	const filteredPair = whitelistedPools.find(
		(p) =>
			(p.pair[0] === pair[0] && p.pair[1] === pair[1]) ||
			(p.pair[0] === pair[1] && p.pair[1] === pair[0])
	);

	return filteredPair?.address || null;
};
