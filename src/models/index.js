import user from "./user.js";
import wishList from "./wishlist.js";
import location from "./location.js";
import review from "./review.js";
import facility from "./facility.js";
import galery from "./galery.js";
import menu from "./menu.js";

const models = async () => {
	await user.sync({
		force: true,
	});
	await location.sync({
		force: true,
	});
	await wishList.sync({
		force: true,
	});
	await review.sync({
		force: true,
	});
	await facility.sync({
		force: true,
	});
	await galery.sync({
		force: true,
	});
	await menu.sync({
		force: true,
	});
};

export default models;
