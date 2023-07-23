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

			// delete all menu
			await menu.destroy({
				where: {
					locationId,
				},
			});

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
	async updateMenu(req, res) {
		const { menuId } = req.params;
		const { name, price } = req.body;
		try {
			await menu.update(
				{
					name,
					price,
				},
				{
					where: {
						menuId,
					},
				}
			);
			res.status(200).send({
				status: "success",
				message: "Menu successfully updated",
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async deleteMenu(req, res) {
		const { menuId } = req.params;
		try {
			await menu.destroy({
				where: {
					menuId,
				},
			});
			res.status(200).send({
				status: "success",
				message: "Menu successfully deleted",
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
