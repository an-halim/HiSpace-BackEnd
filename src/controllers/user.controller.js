import bcrypt from "bcrypt";
import {
	user as User,
	wishList,
	location,
	Conversation,
} from "../models/index.js";
import { sendMail, cloudinary } from "../services/index.js";
import { response, errorTracker, jwt } from "../utils/index.js";
import dotenv from "dotenv";

dotenv.config();

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
					const token = jwt({ email: result.email, userId: result.userId });
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

			const token = jwt({ email: user.email, userId: user.userId });

			response.success(res, {
				email: user.email,
				fullName: user.fullName,
				profilePic: user?.profilePic || null,
				accessToken: token,
			});
		} catch (err) {
			console.log(err);
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
					{
						model: location,
					},
					{
						model: Conversation,
					},
				],
			})
				.then((result) => {
					response.success(res, result);
				})
				.catch((err) => {
					console.log(err);
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

		const randomPassword = jwt({ email: email, userId: user.userId });

		try {
			await User.update(
				{ tempPassword: randomPassword },
				{ where: { email: email } }
			);

			// please visit
			let html = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>Reset Password</title>
					<style>
						body {
							font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
							background-color: #f5f5f5;
							margin: 0;
							padding: 0;
						}
			
						.container {
							max-width: 600px;
							margin: 20px auto;
							padding: 20px;
							background-color: #ffffff;
							border-radius: 10px;
							box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
						}
			
						h1 {
							font-size: 32px;
							color: #333333;
							margin-top: 0;
						}
			
						p {
							font-size: 18px;
							color: #555555;
							line-height: 1.6;
						}
			
						a.button {
							display: inline-block;
							padding: 12px 24px;
							background-color: #4285f4;
							color: #ffffff;
							text-decoration: none;
							border-radius: 30px;
							font-size: 20px;
							transition: background-color 0.3s ease;
						}
			
						a.button:hover {
							background-color: #3367d6;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<p>Hi ${user.fullName},</p>
						<p>
							We have received a request to reset your password. If you did not make
							this request, simply ignore this email. Otherwise, please click the
							button below to reset your password:
						</p>
						<a
							class="button"
							href="${process.env.BASE_URL}/reset-password/${randomPassword}"
							>Reset Password</a
						>
						<p>
							If that does not work, please copy and paste the following link into
							your browser:
						</p>
						<p>${process.env.BASE_URL}/reset-password/${randomPassword}</p>
						<p>Thank you.</p>
					</div>
				</body>
			</html>
			`;
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
				where: {
					tempPassword: token,
				},
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
