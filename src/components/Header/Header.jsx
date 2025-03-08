import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css"; // Importa el archivo CSS Module
import { useTranslation } from "react-i18next";

const Header = ({ children, wineryId }) => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	console.log(wineryId);
	
	return (
		<>
			<div className={styles["product-header"]} style={{backgroundImage: `url('/images/background-${wineryId}.JPG')`}}>
				<div className={styles["product-header-logo"]}>
					<picture>
						<source
							media="(min-width: 576px)"
							srcSet="/images/logo-costaflores.png"
						/>
						<img
							src="/images/logo-costaflores-reduced.png"
							alt="Costaflores"
							style={{ width: "auto" }}
						/>
					</picture>

					<div
						className={styles["product-header-change"]}
						onClick={() => {
							navigate(-1);
						}}
					>
						{t("labels.change")}
					</div>
				</div>

				<div className={"container"}>{children}</div>
			</div>

			{/* <div className={styles["product-content"]}>
				<Tabs />
				<Sensors />
			</div> */}
		</>
	);
};

export default Header;
