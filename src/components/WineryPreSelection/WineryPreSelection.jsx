import React from "react";
import styles from "./WineryPreSelection.module.css"; 
import { useTranslation } from "react-i18next";

const WineryPreSelection = ({ winery }) => {
	const { t } = useTranslation();
	return (
		<div className={styles["card-winery"]}>
			<a href={winery.website} target="_blank" rel="noopener noreferrer">
				<div className={` card ${styles.card} `}>
					<div className={`${styles["card-body"]} card-body`}>
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
							<div className={`${styles["card-img-overlay"]} card-img-overlay`}>
								<p>{t("interest")}</p>
							</div>
						</div>
						<h5 className={styles["card-title"]} style={{ color: "#141414" }}>
							{winery.name}
						</h5>
					</div>
				</div>
			</a>
		</div>
	);
};

export default WineryPreSelection;
