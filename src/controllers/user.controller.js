import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import response from "../utils/response.js";
import errorTracker from "../utils/sequelizeErr.js";
import bcrypt from "bcrypt";
import WishList from "../models/wishlist.js";
import sendMail from "../services/mail.js";
import user from "../models/user.js";

/**
 *
 * @param {String} password
 * @returns hashed password
 * @description encrypt password
 */
const hash = (password) => {
	let saltRound = 10;
	let salt = bcrypt.genSaltSync(saltRound);
	let hash = bcrypt.hashSync(password, salt);
	return hash;
};

dotenv.config();

const userController = {
	regist: async (req, res) => {
		try {
			const data = req.body;
			data.password = hash(data.password);

			User.create(data)
				.then((result) => {
					const token = jwt.sign(
						{ userName: result.userName, email: result.email },
						process.env.JWT_SECRET_KEY,
						{
							expiresIn: "1h",
						}
					);
					response.created(
						res,
						{
							userName: result.userName,
							email: result.email,
							fullName: result.fullName,
							profilePic: result?.profilePic || null,
							accessToken: token,
						},
						"User has been created"
					);
				})
				.catch((err) => {
					console.log(err);
					response.forbiden(res, errorTracker(err));
				});
		} catch (err) {
			console.log(err);
			response.serverError(res, err);
		}
	},

	login: async (req, res) => {
		try {
			const { email, password } = req.body;
			const user = await User.findOne({
				where: { email: email },
			});

			if (!user) {
				return response.notFound(res, "User not found");
			}

			if (!bcrypt.compareSync(password, user.password)) {
				return response.unauthorized(res, "Wrong password");
			}

			const token = jwt.sign(
				{ userName: user.userName, email: user.email },
				process.env.JWT_SECRET_KEY,
				{
					expiresIn: "1h",
				}
			);

			res.cookie("token", token, {
				expiresIn: new Date(Date.now() + 3600000),
				httpOnly: true,
			});

			response.success(res, {
				userName: user.userName,
				email: user.email,
				fullName: user.fullName,
				profilePic: user?.profilePic || null,
				accessToken: token,
			});
		} catch (err) {
			response.serverError(res, err);
		}
	},

	detail: async (req, res) => {
		try {
			const userDetail = jwt.verify(
				req.headers.authorization?.split(" ")[1] || req?.cookies["token"],
				process.env.JWT_SECRET_KEY
			);

			User.findOne({
				where: { userName: userDetail.userName },
				attributes: { exclude: ["password"] },
				include: [
					{
						model: WishList,
					},
				],
			})
				.then((result) => {
					response.success(res, result);
				})
				.catch((err) => {
					response.failed(res, err);
				});
		} catch (err) {
			console.log(err);
			response.serverError(res, err);
		}
	},

	updateDetail: async (req, res) => {
		try {
			let data = req.body;
			const userDetail = jwt.verify(
				req.headers.authorization?.split(" ")[1] || req?.cookies["token"],
				process.env.JWT_SECRET_KEY
			);

			let user = User.findOne({
				where: { userName: userDetail.userName },
			});

			if (!user) {
				return response.notFound(res, "User not found");
			}

			User.update(data, {
				where: { email: userDetail.email },
			})
				.then((result) => {
					response.success(res, "User has been updated");
				})
				.catch((err) => {
					response.failed(res, err);
				});
		} catch (err) {
			console.log("error", err);
			response.serverError(res, err);
		}
	},

	logout: async (req, res) => {
		try {
			res.clearCookie("accessToken");
			return response.success(res, "Logout successfully");
		} catch (err) {
			response.serverError(res, err);
		}
	},

	forgot: async (req, res) => {
		const email = req.body.email;
		const user = await User.findOne({ where: { email: email } });
		if (!user) {
			return res.status(404).json({
				status: "failed",
				message: "Email is not associated with any account",
			});
		}

		const randomPassword = Math.random().toString(36).slice(-8);
		const hashPassword = hash(randomPassword);
		try {
			await User.update(
				{ password: hashPassword },
				{ where: { email: email } }
			);

			let html = `<p>Hi ${user.fullName},</p>
      <p>We have reset your password. Please login with this password: <b>${randomPassword}</b></p>
      <p>Thank you.</p>
      <p>HiSpace Team</p>`;

			let info = await sendMail(email, "Reset Password", html);
			console.log("[SERVER] Message sent: %s", info.messageId, info.accepted);
			res.json({
				status: "success",
				message: "Reset password success, please check your email",
			});
		} catch (err) {
			console.log(err);
		}
	},

	// upadePassword: async (req, res) => {
	// 	const password = req.body.password;
	// 	try {
	// 		const userDetail = jwt.verify(
	// 			req.headers.authorization?.split(" ")[1] || req.cookies["token"],
	// 			process.env.JWT_SECRET_KEY
	// 		);

	// 		if (!password) {
	// 			return response.badRequest(res, "Please fill all the field");
	// 		}

	// 		User.findOne({
	// 			where: { nim: userDetail.nim },
	// 		})
	// 			.then((result) => {
	// 				const hashPassword = hash(password);

	// 				User.update(
	// 					{ password: hashPassword },
	// 					{ where: { nim: userDetail.nim } }
	// 				).then((result) => {
	// 					response.success(res, "Password has been updated");
	// 				});
	// 			})
	// 			.catch((err) => {
	// 				response.failed(res, err);
	// 			});
	// 	} catch (err) {
	// 		response.serverError(res, err);
	// 	}
	// },
};

export default userController;
