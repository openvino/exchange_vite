import React from "react";
import styles from "./ProductWinerySelector.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Countdown from "../countdown/Countdown";

const ProductWinerySelector = ({ winery }) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleWineryClick = (wineryId) => {
		navigate(`/${wineryId}`);
	};


	return (
		<div className={styles["card-winery"]}>
			<div className={` card ${styles.card} `}>
				<div onClick={() => handleWineryClick(winery.ID)} className={`${styles["card-body"]} card-body`}>

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
							loading="lazy"
						/>
						{winery.name === 'Tequendama' && (
							<div className={`${styles["card-img-overlay"]} card-img-overlay`}>
								<Countdown />
							</div>
						)}
					</div>
					<h5 className={styles["card-title"]} style={{ color: "#141414" }}>
						{winery.name}
					</h5>
				</div>
			</div>
		</div>
	);
};

export default ProductWinerySelector;
