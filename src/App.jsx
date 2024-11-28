import React, { useState } from "react";
import "./App.css";
import WinerySelector from "./components/WinerySelector/WinerySelector";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Selector from "./components/Selector/Selector";
import Main from "./components/Main";
import Bridge from "./components/bridge/bridge";
const App = () => {
  const [key, setKey] = useState(0);
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<WinerySelector />} />
          <Route path="/:wineryId" element={<Selector />} />
          <Route
            path="/:wineryId/bridge"
            element={<Bridge setKey={setKey} key={key} />}
          />

          <Route
            path="/:wineryId/:productId"
            element={<Main setKey={setKey} key={key} />}
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
