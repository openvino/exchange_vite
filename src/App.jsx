import React, { useEffect, useState } from "react";
import "./App.css";
import WinerySelector from "./components/WinerySelector/WinerySelector";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Selector from "./components/Selector/Selector";
import Main from "./components/Main";
import { fetchPrice } from "./utils/fetchPrice";
import useWeb3Store from "./config/zustandStore";
// import axios from "axios";
// import { getRedeemTemplateSuccessSpanish } from "./utils/emailTemplate";
const App = () => {
  const setUsdPrice = useWeb3Store((state) => state.setUsdPrice);

  // const sendEmailMessage = async (email, type) => {
  //   try {
  //     let body = {
  //       to: email,
  //       subject: "",
  //       html: "",
  //       text: "",
  //     };

  //     let language = "es";
  //     if (type === "sucess") {
  //       body.subject =
  //         language === "es"
  //           ? "Redimiste tus Wine tokens! 🍷"
  //           : "Wine tokens redeemed - let’s plan your delivery 🍷";
  //       body.html =
  //         language === "es"
  //           ? getRedeemTemplateSuccessSpanish("arguellojuan08@gmail.com")
  //           : getRedeemTemplateSuccess("arguellojuan08@gmail.com");
  //     }

  //     if (type === "error") {
  //       body.subject =
  //         language === "es"
  //           ? "Redimiste tus Wine tokens! - pago de envío pendiente ⚠️"
  //           : "Wine tokens redeemed - shipping payment pending";
  //       body.html =
  //         language === "es"
  //           ? getRedeemTemplateWithErrorsSpanish(
  //               "TORO TOKEN",
  //               "@nachoflores",
  //               "arguellojuan08@gmail.com"
  //             )
  //           : getRedeemTemplateWithErrors(
  //               "TORO TOKEN",
  //               "@nachoflores",
  //               "arguellojuan08@gmail.com"
  //             );
  //     }

  //     console.log(body);

  //     const message = await axios.post(
  //       `${"https://dondetopa.openvino.org"}/email/send`,
  //       body
  //     );

  //     return message;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    fetchPrice()
      .then((result) => {
        setUsdPrice(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <>
      {/* <button
        style={{ marginTop: 202 }}
        onClick={() => sendEmailMessage("arguellojuan08@gmail.com", "sucess")}
      >
        eskere
      </button> */}
      <Router>
        <Routes>
          <Route path="/" element={<WinerySelector />} />
          <Route path="/:wineryId" element={<Selector />} />
          <Route path="/openvinodao" element={<WinerySelector />} />

          <Route path="/:wineryId/:productId" element={<Main />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
