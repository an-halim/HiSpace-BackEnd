import user from "./user.js";
import wishList from "./wishlist.js";
import location from "./location.js";
import review from "./review.js";
import facility from "./facility.js";
import galery from "./galery.js";
import menu from "./menu.js";
import Conversation from "./coversation.js";
import Chat from "./chat.js";

const models = async () => {
	await user.sync({
		alter: true,
	});
	await location.sync({
		alter: true,
	});
	await wishList.sync({
		alter: true,
	});
	await review.sync({
		alter: true,
	});
	await facility.sync({
		alter: true,
	});
	await galery.sync({
		alter: true,
	});
	await menu.sync({
		alter: true,
	});
	await Conversation.sync({
		alter: true,
	});
	await Chat.sync({
		alter: true,
	});
};

export {
	models,
	user,
	wishList,
	location,
	review,
	facility,
	galery,
	menu,
	Conversation,
	Chat,
};
