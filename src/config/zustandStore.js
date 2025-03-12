import { create } from "zustand";

const useWeb3Store = create((set) => ({
	usdPrice: 0,
	library: null,
	provider: null,
	activeAccount: null,
	signer: null,
	products: null,
	isHuman: false,

	setUsdPrice: (usdPrice) => set({ usdPrice }),
	setLibrary: (library) => set({ library }),
	setSigner: (signer) => set({ signer }),
	setProvider: (provider) => set({ provider }),
	setActiveAccount: (activeAccount) => set({ activeAccount }),

	setProducts: (products) => set({ products }),
	setIsHuman: (isHuman) => set({ isHuman }),
}));

export default useWeb3Store;
