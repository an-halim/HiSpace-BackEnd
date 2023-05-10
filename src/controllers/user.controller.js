import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import response from "../utils/response.js";
import errorTracker from "../utils/sequelizeErr.js";
import bcrypt from "bcrypt";
import WishList from "../models/wishlist.js";
import sendMail from "../services/mail.js";

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
						{ email: result.email },
						process.env.JWT_SECRET_KEY,
						{
							expiresIn: "1h",
						}
					);
					response.created(
						res,
						{
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
				{ email: user.email },
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
				where: { email: userDetail.email },
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
				where: { email: userDetail.email },
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

		const randomPassword = Math.random().toString(36).slice(-16);
		try {
			await User.update(
				{ tempPassword: randomPassword },
				{ where: { email: email } }
			);

			// please visit
			let html = `<h1>Reset Password</h1>
			<p>Hi ${user.fullName},</p>
			<p>We have received a request to reset your password. If you did not make this request, simply ignore this email. Otherwise, please click the button below to reset your password:</p>
			<a href="http://localhost:3000/reset-password/${randomPassword}">Reset Password</a>
			<p>Thank you.</p>`;
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

	verifyToken: async (req, res) => {
		const token = req.params.token;
		try {
			if (!token) {
				return response.badRequest(res, "Please fill all the field");
			}

			User.findOne({
				where: { tempPassword: token },
			})
				.then((result) => {
					if (!result) {
						return response.notFound(res, "Token is not valid");
					}
					res.cookie("token", token, {
						expiresIn: new Date(Date.now() + 3600000),
						httpOnly: true,
					});
					response.success(res, "Token is valid");
				})
				.catch((err) => {
					response.failed(res, err);
				});
		} catch (err) {
			response.serverError(res, err);
		}
	},
	upadatePassword: async (req, res) => {
		const token = req.params.token;
		const { password } = req.body;
		try {
			if (!token || !password) {
				return response.badRequest(res, "Please fill all the field");
			}

			User.findOne({
				where: { tempPassword: token },
			})
				.then((result) => {
					const hashPassword = hash(password);

					User.update(
						{
							password: hashPassword,
							tempPassword: null,
						},
						{ where: { tempPassword: token } }
					).then((result) => {
						response.success(res, "Password has been updated");
					});
				})
				.catch((err) => {
					response.failed(res, err);
				});
		} catch (err) {
			response.serverError(res, err);
		}
	},
};

export default userController;
