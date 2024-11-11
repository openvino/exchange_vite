import React, { useState } from "react";
import "./App.css";
import WinerySelector from "./components/WinerySelector/WinerySelector";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Selector from "./components/Selector/Selector";
import Main from "./components/Main";
const App = () => {
	const [key, setKey] = useState(0);
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<WinerySelector />} />
					<Route path="/:wineryId" element={<Selector />} />
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
