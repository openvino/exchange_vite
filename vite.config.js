import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [nodePolyfills(), react()],
	esbuild: {
		target: "esnext",
		jsx: "automatic",
		minify: true,
	},
});
