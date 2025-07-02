export const getTokenImageUrl = (tokenName, wineryId) => {

	const bottleUrl = `/static/${wineryId}/${tokenName}/bottle.png`;
	const imageUrl = `/static/${wineryId}/${tokenName}/image.png`;
	const tokenUrl = `/static/${wineryId}/${tokenName}/token.svg`;
	return { bottleUrl, imageUrl, tokenUrl };
};
