import user from "./user.js";
import wishList from "./wishlist.js";
import location from "./location.js";
import review from "./review.js";
import facility from "./facility.js";
import galery from "./galery.js";
import menu from "./menu.js";
import Conversation from "./coversation.js";
import Chat from "./chat.js";
import dotenv from "dotenv";

dotenv.config();

const models = async () => {
	await user.sync({
		alter: process.env.ALTER_DB,
	});
	await location.sync({
		alter: process.env.ALTER_DB,
	});
	await wishList.sync({
		alter: process.env.ALTER_DB,
	});
	await review.sync({
		alter: process.env.ALTER_DB,
	});
	await facility.sync({
		alter: process.env.ALTER_DB,
	});
	await galery.sync({
		alter: process.env.ALTER_DB,
	});
	await menu.sync({
		alter: process.env.ALTER_DB,
	});
	await Conversation.sync({
		alter: process.env.ALTER_DB,
	});
	await Chat.sync({
		alter: process.env.ALTER_DB,
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
