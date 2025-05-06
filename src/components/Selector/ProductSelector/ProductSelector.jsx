import React, { useEffect } from "react";
import styles from "./ProductSelector.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../context";
import { getTokenImageUrl } from "../../../utils/getStaticImages";
const ProductSelector = ({ product }) => {
	const { wineryId } = useParams();
	const [state, setState] = useAppContext();
	const navigate = useNavigate();

	const handleProductClick = () => {
		navigate(`/${wineryId}/${product.id}`);
	};
	const { bottleUrl, imageUrl, tokenUrl } = getTokenImageUrl(
		product.id?.toLowerCase(),
		wineryId?.toLocaleLowerCase()
	);
	return (
		<div
			className={`${styles["product-selector-container"]} col-6 col-sm-6 col-md-4 col-lg-3`}
			
		>
			<div className={`${styles["product-selector"]} product-selector`}>
				<img
				onClick={handleProductClick}
					className={styles["product-selector-img"]}
					alt={product.id}
					src={imageUrl}
				/>
			</div>
		</div>
	);
};

export default ProductSelector;
