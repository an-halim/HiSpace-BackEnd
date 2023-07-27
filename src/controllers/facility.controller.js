import { location, review, user, menu, facility } from "../models/index.js";
import { Op } from "sequelize";

const facilityController = {
	async create(req, res) {
		const { locationId } = req.params;
		const { name } = req.body;
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

			// find all facility and delete
			await facility.destroy({
				where: {
					locationId,
				},
			});

			if (req.body.length > 1) {
				let data = req.body.map((item) => {
					return {
						locationId,
						name: item.name,
						locationLocationId: locationId,
					};
				});
				console.log(data);
				const addFacility = await facility.bulkCreate(data);
				return res.status(201).send({
					status: "success",
					message: "Facility successfully added",
					data: addFacility,
				});
			}

			const addFacility = await facility.create({
				locationId,
				name,
				locationLocationId: locationId,
			});

			res.status(201).send({
				status: "success",
				message: "Menu successfully added",
				data: addFacility,
			});
		} catch (err) {
			console.log(err);
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async read(req, res) {
		const { locationId } = req.params;
		try {
			const facilities = await facility.findAll({
				where: {
					locationId,
				},
				attributes: ["facilityId", "name"],
			});

			res.status(200).send({
				status: "success",
				message: "Facility successfully fetched",
				data: facilities,
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
	async update(req, res) {
		const { facilityId } = req.params;
		const { name } = req.body;
		try {
			await facility.update(
				{
					name,
				},
				{
					where: {
						facilityId,
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
	async delete(req, res) {
		const { facilityId } = req.params;

		try {
			await facility.destroy({
				where: {
					facilityId,
				},
			});
			res.status(200).send({
				status: "success",
				message: "Facility successfully deleted",
			});
		} catch (err) {
			res.status(500).send({
				status: "failed",
				message: err.message,
			});
		}
	},
};

export default facilityController;
