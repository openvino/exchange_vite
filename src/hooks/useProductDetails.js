import { useEffect, useMemo, useState } from "react";
import { getProductsByWinery } from "../lib/api/products";
import { getWineries } from "../lib/api/wineries";
import { getTokenImageUrl } from "../utils/getStaticImages";
import { getPairAddressFromTokenAddress } from "../entities";

const createEmptyResult = () => ({
  product: null,
  winery: null,
  images: null,
  pairAddress: null,
});

export function useProductDetails({ wineryId, productId }) {
  const [data, setData] = useState(() => createEmptyResult());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetails() {
      if (!wineryId || !productId) {
        if (isMounted) {
          setData(createEmptyResult());
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [products, wineries] = await Promise.all([
          getProductsByWinery(wineryId),
          getWineries(),
        ]);

        const normalizedProductId = String(productId).toLowerCase();
        const normalizedWineryId = String(wineryId).toLowerCase();

        const product =
          products.find(
            (item) => String(item.id).toLowerCase() === normalizedProductId
          ) ?? null;

        const winery =
          wineries.find(
            (item) => String(item.ID).toLowerCase() === normalizedWineryId
          ) ?? null;


		 
        const images = product
          ? getTokenImageUrl(
              String(product.id).toLowerCase(),
              String(product.WinerieID).toLowerCase()
            )
          : null;

        const pairAddress = product
          ? getPairAddressFromTokenAddress(product.token_address)
          : null;

        if (isMounted) {
          setData({
            product,
            winery,
            images,
            pairAddress,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(createEmptyResult());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [wineryId, productId]);

  const memoizedData = useMemo(() => data, [data]);

  return {
    data: memoizedData,
    loading,
    error,
  };
}

export default useProductDetails;
