import { location, review, user } from "../models/index.js";
import { Op } from "sequelize";

const reviewController = {
	async createReview(req, res) {
		const { locationId } = req.params;
		const { rating, comment } = req.body;
		const { userId } = req.user;
		console.log(req.user);

		try {
			const locations = await location.findOne({
				where: {
					locationId,
				},
			});

			if (!locations) {
				return res.status(404).send({
					status: "failed",
					message: "Location not found",
				});
			}

			const checkReview = await review.findOne({
				where: {
					userId,
					locationId,
				},
			});

			if (checkReview) {
				return res.status(400).send({
					status: "failed",
					message: "You already review this location",
				});
			}

			const newReview = await review.create({
				userId,
				locationId,
				rating,
				comment,
				locationLocationId: locationId,
			});

			const locationRating = await review.findAll({
				where: {
					locationId,
				},
			});

			let totalRating = 0;

			locationRating.map((item) => {
				totalRating += item.rating;
			});

			const averageRating = totalRating / locationRating.length;

			await location.update(
				{
					rating: averageRating,
				},
				{
					where: {
						locationId,
					},
				}
			);

			res.status(201).send({
				status: "success",
				message: "Review successfully created",
				data: newReview,
			});
		} catch (err) {
			console.log(err);
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async getAllReview(req, res) {
		const { locationId } = req.params;
		try {
			const reviews = await review.findAll({
				where: {
					locationId,
				},
				attributes: ["userId", "reviewId", "rating", "comment", "createdAt"],
			});

			// find user and add to review
			const users = await user.findAll({
				where: {
					userId: {
						[Op.in]: reviews.map((item) => item.userId),
					},
				},
				attributes: ["userId", "fullName", "email", "profilePic"],
			});

			// push user to review
			reviews.map((item) => {
				const user = users.find((user) => user.userId === item.userId);
				return (item.dataValues.user = user);
			});

			res.status(200).send({
				status: "success",
				message: "Reviews successfully fetched",
				data: reviews,
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async updateReview(req, res) {
		const { reviewId } = req.params;
		const { rating, comment } = req.body;
		try {
			await review.update(
				{
					rating,
					comment,
				},
				{
					where: {
						reviewId,
					},
				}
			);
			res.status(200).send({
				status: "success",
				message: "Review successfully updated",
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async deleteReview(req, res) {
		const { reviewId } = req.params;

		try {
			await review.destroy({
				where: {
					reviewId,
				},
			});
			res.status(200).send({
				status: "success",
				message: "Review successfully deleted",
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
};

export default reviewController;
