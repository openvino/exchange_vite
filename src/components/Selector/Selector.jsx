import React, { useEffect, useState } from "react";
import { axiosClient } from "../../config/axiosClient";
import { useLocation, useParams } from "react-router-dom";
import ProductSelector from "./ProductSelector/ProductSelector";
import styles from "./Selector.module.css";
import { useTranslation } from "react-i18next";
import BeatLoader from "react-spinners/BeatLoader";
import { useAppContext } from "../../context";
import useWeb3Store from "../../config/zustandStore";
import { fetchPrice } from "../../utils/fetchPrice";

const Selector = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	const { wineryId } = useParams();

	const { t } = useTranslation();
	const location = useLocation();
	const [state, setState] = useAppContext();
	const { setUsdPrice } = useWeb3Store();

	useEffect(() => {
		setState((prevState) => ({
			...prevState,
			tokenName: "",
			crowdsaleAddress: "",
			networkId: "",
			tokenAddress: "",
			image: "",
			tokenYear: "",
			tokenIcon: "",
			apiUrl: import.meta.env.VITE_APIURL,
			title: "",
			shippingAccount: "",
			validationState: undefined,
			loading: true,
		}));

		fetchPrice()
			.then((result) => {
				setUsdPrice(result);
			})
			.catch((error) => {
				console.error("Error fetching price:", error);
			});
	}, [location.pathname]);
	const getProductList = async () => {
		try {
			const productsWineries = await axiosClient.get("/token", {
				params: { winerie_id: wineryId },
			});
			setProducts(productsWineries.data);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getProductList();
	}, []);

	return (
		<div className={styles["selector"]}>
			<div className={`${styles["container"]} container`}>
				<div className={styles["selector-header"]}>
					<picture>
						<source
							media="(min-width: 576px)"
							srcSet="images/openvino-logo.png"
						/>
						<img
							src="images/openvino-logo.png"
							alt="Costaflores"
							style={{ width: 200 }}
							loading="lazy"
						/>
					</picture>
				</div>
				<div className={styles["selector-content"]}>
					<div>
						<a className={styles["btn-back"]} href="/">
							{t("wineries.back")}
						</a>
					</div>
					
					{products[0]?.id && (
						<div className={`${styles["selector-content-header"]} py-4 py-sm-5`}>
						<h1>{t("selection.title") + " " + products[0]?.id.slice(0, -2)}</h1>

						{products[0]?.WinerieID === 'costaflores' && (
								<h2 className={styles["subtitle"]}>{t("selection.subtitle")}</h2>
						)}
					
					</div>
					)}
					
					<div
						className={`row justify-content-center ${styles["selector-content-items"]}`}
					>
						{loading ? (
							<div className="d-flex justify-content-center align-items-center">
								<BeatLoader
									color="#d68513"
									loading={true}
									cssOverride={{
										display: "flex",
										flexDirection: "row",
									}}
									size={25}
									aria-label="Loading Spinner"
									data-testid="loader"
								/>
							</div>
						) : (
							products &&
							products
								.sort((a, b) => a.year - b.year)
								.map((product) => (
									<ProductSelector key={product.id} product={product} />
								))
						)}
					</div>
					<div className={styles["selector-content-button"]}>

						<a style={{ color: 'white', textDecoration: 'none' }} target="_blank" href="https://openvino.atlassian.net/wiki/spaces/OPENVINO/overview">
							{t("selection.know-more")}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Selector;
