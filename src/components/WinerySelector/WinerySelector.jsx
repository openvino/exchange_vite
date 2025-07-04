import React, { useEffect, useState } from "react";
import styles from "./WinerySelector.module.css";
import { axiosClient } from "../../config/axiosClient";
import ProductWinerySelector from "../ProductWinerySelector/ProductWinerySelector";
import { getComingSoonWineriesList } from "../../utils/getComingSoonWineries";
import ProductComingSoonWinerySelector from "../ProductComingSoonWinerySelector/ProductComingSoonWinerySelector";
import { useTranslation } from "react-i18next";
import { useNavigate, useNavigation } from "react-router-dom";
const WinerySelector = () => {
	const [wineries, setWineries] = useState([]);
	const [comingSoonWineies, setComingSoonWineies] = useState([]);

	const [filteredWineries, setFilteredWineries] = useState([]);
	const [filteredComingSoon, setFilteredComingSoon] = useState([]);

	const { t } = useTranslation();

  const getWineries = async () => {
    const response = await axiosClient.get("/wineries");
    setWineries(response.data);

    const reordered = [...response.data].sort((a, b) => {
      if (a.name.toLowerCase() === "costaflores") return -1;
      if (b.name.toLowerCase() === "costaflores") return 1;
      return 0;
    });
    setWineries(reordered);
    setFilteredWineries(reordered);

		const comingSoon = getComingSoonWineriesList();
		setComingSoonWineies(comingSoon);
		setFilteredComingSoon(comingSoon);
	};
	useEffect(() => {
		getWineries();
	}, []);

	const searchWineries = (event) => {
		const searchValue = event.target.value.toLowerCase();

		if (!searchValue) {
			// si está vacío, restablece la lista completa
			setFilteredWineries(wineries);
			setFilteredComingSoon(comingSoonWineies);
			return;
		}

		const filtered = wineries.filter((winery) =>
			winery.name.toLowerCase().includes(searchValue)
		);

		const filteredComing = comingSoonWineies.filter((winery) =>
			winery.name.toLowerCase().includes(searchValue)
		);

		setFilteredWineries(filtered);
		setFilteredComingSoon(filteredComing);
	};

	const navigate = useNavigate();

	return (
		<div className={styles["winery-selector"]}>
			<nav
				className={`navbar navbar-expand-lg navbar-light ${styles["winery-selector-navbar"]}`}
			>
				<div className="d-flex justify-content-between w-100">
					<div>
						<a className="navbar-brand">
							<img
								src="/images/openvino-logo.png"
								alt="Openvino"
								style={{ width: 200 }}
							/>
						</a>
					</div>
					<button
						className="navbar-toggler"
						type="button"
						data-toggle="collapse"
						data-target="#navbarNavAltMarkup"
						aria-controls="navbarNavAltMarkup"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
				</div>

				<div
					className="collapse navbar-collapse w-full justify-content-end"
					id="navbarNavAltMarkup"
				>
					<div className="navbar-nav">
						<a
							className="nav-item nav-link"
							href="https://openvino.atlassian.net/wiki/spaces/OPENVINO/overview?mode=global"
							target="blank"
						>
							{t("wineries.openvino-wiki")}
						</a>
						<a
							className="nav-item nav-link"
							href="https://openvino.org/es/"
							target="blank"
						>
							{t("wineries.contact")}
						</a>
						{/* <a
							className="nav-item nav-link"
							target="blank"
							onClick={() => navigate("/openvinodao")}
						>
							DAO
						</a> */}
					</div>
				</div>
			</nav>

			<div className="container">
				<div className={styles["winery-selector-content"]}>
					<div className="d-sm-flex align-items-center justify-content-between py-2 py-sm-3">
						<div className={`pb-2 ${styles["selector-content-header"]}`}>
							<h1>{t("wineries.title")}</h1>
						</div>
						<div
							className={`input-group rounded pb-2 ${styles["input-group"]}`}
						>
							<input
								type="text"
								className={`rounded form-control search-input ${styles["form-control"]}`}
								placeholder={t("wineries.search")}
								name="searchTerm"
								onChange={(event) => searchWineries(event)}
							/>
						</div>
					</div>
					<div className={`${styles["card-group"]} card-group`}>
						{filteredWineries.map((winery, index) => (
							<ProductWinerySelector
								key={winery.id ? `winery-${winery.id}` : `winery-${index}`}
								winery={winery}
							/>
						))}

						{filteredComingSoon.map((winery, index) => (
							<ProductComingSoonWinerySelector
								key={
									winery.id ? `comingSoon-${winery.id}` : `comingSoon-${index}`
								}
								winery={winery}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default WinerySelector;
