import { location, review, user, menu } from "../models/index.js";
import { Op } from "sequelize";

const menuController = {
	async addMenu(req, res) {
		const { locationId } = req.params;
		const { name, price } = req.body;
		const { userId } = req.user;
		console.log(req.user);

		try {
			const locations = await location.findOne({
				where: {
					locationId,
					userUserId: userId,
				},
			});

			if (!locations) {
				return res.status(404).send({
					status: "failed",
					message: "Location not found",
				});
			}

			if (req.body.length > 1) {
				let data = req.body.map((item) => {
					return {
						locationId,
						name: item.name,
						price: item.price,
						locationLocationId: locationId,
					};
				});
				console.log(data);
				const addMenu = await menu.bulkCreate(data);
				return res.status(201).send({
					status: "success",
					message: "Menu successfully added",
					data: addMenu,
				});
			}

			const addMenu = await menu.create({
				locationId,
				name,
				price,
				locationLocationId: locationId,
			});

			res.status(201).send({
				status: "success",
				message: "Menu successfully added",
				data: addMenu,
			});
		} catch (err) {
			console.log(err);
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async getAllMenu(req, res) {
		const { locationId } = req.params;
		try {
			const menus = await menu.findAll({
				where: {
					locationId,
				},
				attributes: ["menuId", "name", "price"],
			});

			res.status(200).send({
				status: "success",
				message: "Menu successfully fetched",
				data: menus,
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

export default menuController;
