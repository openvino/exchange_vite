import { create } from "zustand";

const store = create((set) => ({
	pools: [],
	activeAccount: null,
	signer: null,

	isHuman: false,

	setPools: (pools) => set({ pools }),
	setActiveAccount: (activeAccount) => set({ activeAccount }),
	setSigner: (signer) => set({ signer }),

	setIsHuman: (isHuman) => set({ isHuman }),
}));

export default store;
