import user from "./user.js";
import wishList from "./wishlist.js";

const models = async () => {
	await user.sync({
		force: true,
	});
	await wishList.sync({
		force: true,
	});
};

export default models;
