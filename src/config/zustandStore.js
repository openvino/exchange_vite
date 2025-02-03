import { create } from "zustand";

const useWeb3Store = create((set) => ({
	provider: null,
	activeAccount: null,
	signer: null,
	products: null,
	isHuman: false,

	setProvider: (provider) => set({ provider }),
	setActiveAccount: (activeAccount) => set({ activeAccount }),
	setSigner: (signer) => set({ signer }),
	setProducts: (products) => set({ products }),
	setIsHuman: (isHuman) => set({ isHuman }),
}));

export default useWeb3Store;
