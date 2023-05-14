import bcrypt from "bcrypt";
import { user as User, wishList } from "../models/index.js";
import { sendMail, cloudinary } from "../services/index.js";
import { response, errorTracker, jwt } from "../utils/index.js";

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

const userController = {
	regist: async (req, res) => {
		try {
			const data = req.body;
			console.log(data);
			data.password = hash(data.password);

			User.create(data)
				.then((result) => {
					const token = jwt({ email: result.email });
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

			const token = jwt({ email: user.email });

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
			const { email } = req.user;

			User.findOne({
				where: { email: email },
				attributes: {
					exclude: ["password", "tempPassword", "createdAt", "updatedAt"],
				},
				include: [
					{
						model: wishList,
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
			const { email } = req.user;

			let user = User.findOne({
				where: { email: email },
			});

			if (!user) {
				return response.notFound(res, "User not found");
			}

			let uploadResult = [];

			for (let key in req.files) {
				const image = req.files[key];
				await cloudinary.uploader.upload(image.filepath).then((result) => {
					uploadResult.push(result.secure_url);
				});
			}

			data.profilePic = uploadResult[0];
			data.email = email;
			User.update(data, {
				where: { email: email },
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
