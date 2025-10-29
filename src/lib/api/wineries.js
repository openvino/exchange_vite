import { axiosClient } from "../../config/axiosClient";

export async function getWineries() {
  try {
    const wineries = await axiosClient.get("/wineries");
    return wineries.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
