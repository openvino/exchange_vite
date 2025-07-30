import React, { useEffect, useState } from "react";
import "./App.css";
import WinerySelector from "./components/WinerySelector/WinerySelector";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Selector from "./components/Selector/Selector";
import Main from "./components/Main";
import { fetchPrice } from "./utils/fetchPrice";
import useWeb3Store from "./config/zustandStore";
const App = () => {
	const [key, setKey] = useState(0);
	const setUsdPrice = useWeb3Store((state) => state.setUsdPrice);

	useEffect(() => {
		fetchPrice().then((result) => {
			setUsdPrice(result);
		}).catch((error) => {
			console.log(error);
		});
	}, []);
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<WinerySelector />} />
					<Route path="/:wineryId" element={<Selector />} />
					<Route path="/openvinodao" element={<WinerySelector />} />

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
