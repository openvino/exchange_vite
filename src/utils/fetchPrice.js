import axios from "axios";
import { API_SECRET, DASHBOARD_URL } from "../config";

const apiSecret = API_SECRET;
const apiUrl = DASHBOARD_URL;


export const fetchPrice = async (from = "ETH", to = "USDC") => {
  const headersObj = {
    Authorization: `Bearer ${apiSecret}`,
  };

  let response = 0;
  try {
    if (apiSecret) {
      try {
        const res = await axios.get(
          `${apiUrl}/api/routes/priceRoute?from=${from}&to=${to}`,
          {
            headers: headersObj,
          }
        );
        response = res.data.data.ETH.price;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Incorrect or missing api secret");
    }
  } catch (error) {
    console.log(error);
  }
  return response;
};
