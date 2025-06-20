import React from "react";
import styles from "./ProductWinerySelector.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Countdown from "../countdown/Countdown";

const ProductWinerySelector = ({ winery }) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleWineryClick = (wineryId) => {
		

		if (wineryId === "trilla") {
			navigate(`/trilla/TT25`);
			return;
		}

		if (wineryId === "tequendama") {
			navigate(`/tequendama/PDC19`);
			return;
		}

		if (wineryId === "serrera") {
			navigate(`/serrera/BCN24`);
			return;
		}

		if (wineryId === "ricardosantos") {
			navigate(`/ricardosantos/VARSI22`);
			return;
		}

		navigate(`/${wineryId}`);
	};

	return (
		<div className={styles["card-winery"]}>
			<div className={` card ${styles.card} `}>
				<div
					onClick={() => handleWineryClick(winery.ID)}
					className={`${styles["card-body"]} card-body`}
				>
					<p className={styles["card-img-link"]}>
						{t("wineries.visit-winery")}{" "}
					</p>

					<div className={`${styles.card} bg-dark text-white card`}>
						<img
							className={styles["card-img"]}
							src={
								winery.image
									? winery.image
									: "/images/placeholder_comingsoon.jpg"
							}
							alt={winery.name}
						/>

						{winery.name === "Ricardo Santos" && (
							<div className={`${styles["card-img-overlay"]} card-img-overlay`}>
								<Countdown
									year={2025}
									month={6}
									day={15}
									// hours={12}
									// minutes={0}
									// seconds={0}
								/>
							</div>
						)}
					</div>
					<h5 className={styles["card-title"]} style={{ color: "#141414" }}>
						{winery.name == "Trilla" ? "Territorios Trilla" : winery.name}
					</h5>
				</div>
			</div>
		</div>
	);
};

export default ProductWinerySelector;
