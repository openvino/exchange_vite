import { axiosClient } from "../../config/axiosClient";

export async function getProductsByWinery(winerie_id) {
	try {
		const response = await axiosClient.get("/token", {
			params: { winerie_id },
		});
		return response.data;
	} catch (error) {
		console.log(error);
		return [];
	}
}
