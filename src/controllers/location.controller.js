import location from "../models/location.js";
import review from "../models/review.js";
import user from "../models/user.js";
import menu from "../models/menu.js";
import galery from "../models/galery.js";
import facility from "../models/facility.js";
import { Op } from "sequelize";

const locationController = {
	async createLocation(req, res) {
		try {
			const {
				name,
				address,
				longitude,
				latitude,
				owner,
				galeryId,
				description,
				time,
			} = req.body;
			const newLocation = await location.create({
				name,
				address,
				longitude,
				latitude,
				owner,
				galeryId,
				description,
				time,
			});
			res.status(201).send({
				message: "Location successfully created",
				data: newLocation,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
	async getAllLocation(req, res) {
		console.log(req.query);
		if (req?.query?.tags) {
			try {
				const { tags } = req.query;
				console.log(req.query);
				const locationByTags = await location.findAll({
					where: {
						tags: {
							[Op.like]: `%${tags}%`,
						},
					},
				});
				res.status(200).send({
					message: "Get location by tags successfully",
					data: locationByTags,
				});
			} catch (error) {
				console.log(error);
				res.status(500).send({
					message: "Internal Server Error",
				});
			}
		} else {
			try {
				const allLocation = await location.findAll({
					attributes: {
						exclude: ["createdAt", "updatedAt"],
					},
				});
				res.status(200).send({
					message: "Get all location successfully",
					data: allLocation,
				});
			} catch (error) {
				console.log(error);
				res.status(500).send({
					message: "Internal Server Error",
				});
			}
		}
	},
	async getLocationById(req, res) {
		try {
			const { locationId } = req.params;
			const locationById = await location.findOne({
				where: {
					locationId,
				},
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
				include: [
					{
						model: review,
						attributes: {
							exclude: ["createdAt", "updatedAt"],
						},
					},
					{
						model: user,
						attributes: {
							exclude: ["createdAt", "updatedAt"],
						},
					},
					{
						model: menu,
						attributes: {
							exclude: ["createdAt", "updatedAt"],
						},
					},
					{
						model: galery,
						attributes: {
							exclude: ["createdAt", "updatedAt"],
						},
					},
					{
						model: facility,
						attributes: {
							exclude: ["createdAt", "updatedAt"],
						},
					},
				],
			});
			res.status(200).send({
				message: "Get location by id successfully",
				data: locationById,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
	async getLocationByOwner(req, res) {
		try {
			const { owner } = req.params;
			const locationByOwner = await location.findAll({
				where: {
					owner,
				},
			});
			res.status(200).send({
				message: "Get location by owner successfully",
				data: locationByOwner,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
	async getLocationByTags(req, res) {
		try {
			const { tags } = req.query;
			console.log(req.query);
			const locationByTags = await location.findAll({
				where: {
					tags: {
						[Op.like]: `%${tags}%`,
					},
				},
			});
			res.status(200).send({
				message: "Get location by tags successfully",
				data: locationByTags,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
};

export default locationController;
