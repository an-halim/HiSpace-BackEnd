import { Chat, Conversation, user } from "../models/index.js";

const chatController = {
	createConversation: async (req, res) => {
		const { userId } = req.user;
		const { message, receiverId } = req.body;

		try {
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: "failed",
				message: err.message,
			});
		}
	},
};
