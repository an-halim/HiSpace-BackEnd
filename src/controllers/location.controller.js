import {
	location,
	review,
	user,
	menu,
	galery,
	facility,
} from "../models/index.js";
import { Op } from "sequelize";
import cloudinary from "../services/cloudinary.js";

const locationController = {
	async createLocation(req, res) {
		try {
			const { name, address, longitude, latitude, description, time } =
				req.body;

			const { email } = req.user;

			const owner = await user.findOne({
				where: {
					email,
				},
			});

			let uploadResult = [];

			for (let key in req.files) {
				const image = req.files[key];
				await cloudinary.uploader.upload(image.filepath).then((result) => {
					uploadResult.push(result.secure_url);
				});
			}

			await location
				.create({
					name,
					address,
					longitude,
					latitude,
					owner: owner.fullName,
					ownerEmail: owner.email,
					userUserId: owner.userId,
					description,
					time,
				})
				.then((result) => {
					uploadResult.map((image) => {
						galery.create({
							locationId: result.locationId,
							locationLocationId: result.locationId,
							imageUrl: image,
						});
					});
					return result;
				})
				.then((result) => {
					res.status(201).send({
						status: "success",
						message: "Location successfully created",
						data: result,
					});
				});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
	// 	try {
	// 		const {
	// 			name,
	// 			address,
	// 			longitude,
	// 			latitude,
	// 			owner,
	// 			galeryId,
	// 			description,
	// 			time,
	// 		} = req.body;
	// 		const newLocation = await location.create({
	// 			name,
	// 			address,
	// 			longitude,
	// 			latitude,
	// 			owner,
	// 			galeryId,
	// 			description,
	// 			time,
	// 		});
	// 		res.status(201).send({
	// 			message: "Location successfully created",
	// 			data: newLocation,
	// 		});
	// 	} catch (error) {
	// 		console.log(error);
	// 		res.status(500).send({
	// 			message: "Internal Server Error",
	// 		});
	// 	}
	// },
	async getAllLocation(req, res) {
		console.log(req.query);
		let page = Number(req?.query?.page) || 1;
		let limit = Number(req?.query?.limit) || 5;
		let offset = (page - 1) * limit;

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
					attributes: {
						exclude: [
							"owner",
							"galeryId",
							"description",
							"createdAt",
							"updatedAt",
							"userUserId",
						],
					},
				});
				res.status(200).send({
					status: "success",
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
					// pagination
					limit: limit || null,
					offset: offset || null,
					attributes: {
						exclude: [
							"owner",
							"galeryId",
							"description",
							"createdAt",
							"updatedAt",
							"userUserId",
							"tags",
						],
					},
					include: [
						{
							model: galery,
							attributes: {
								exclude: [
									"locationId",
									"locationLocationId",
									"createdAt",
									"updatedAt",
								],
							},
						},
						{
							model: menu,
							attributes: ["menuId", "name", "price"],
						},
					],
				});
				res.status(200).send({
					status: "success",
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
							exclude: [
								"locationId",
								"locationLocationId",
								"createdAt",
								"updatedAt",
							],
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
							exclude: [
								"locationId",
								"locationLocationId",
								"createdAt",
								"updatedAt",
							],
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
				status: "success",
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
			console.log(req.query);
			let page = Number(req?.query?.page) || 1;
			let limit = Number(req?.query?.limit) || 5;
			let offset = (page - 1) * limit;
			const { owner } = req.query;
			const { latitude, longitude } = req.query;
			const { name } = req.query;
			const { priceFrom, priceTo } = req.query;
			const { facility } = req.query;

			if (owner) {
				const locationByOwner = await location.findAll({
					// pagination
					limit: limit || null,
					offset: offset || null,
					where: {
						ownerEmail: owner,
					},
				});
				locationByOwner.length > 0
					? res.status(200).send({
							status: "success",
							message: "Get location by owner successfully",
							data: locationByOwner,
					  })
					: res.status(404).send({
							status: "failed",
							message: "Location not found",
					  });
			} else if (latitude && longitude) {
				const locationByLocation = await location.findAll({
					// pagination
					limit: limit || null,
					offset: offset || null,
					where: {
						latitude: {
							[Op.between]: [latitude - 0.5, Number(latitude) + 0.5],
						},
						longitude: {
							[Op.between]: [longitude - 0.5, Number(longitude) + 0.5],
						},
					},
				});

				locationByLocation.length > 0
					? res.status(200).send({
							status: "success",
							message: "Get location by location successfully",
							data: locationByLocation,
					  })
					: res.status(404).send({
							status: "failed",
							message: "Location not found",
					  });
			} else if (name) {
				const locationByName = await location.findAll({
					// pagination
					limit: limit || null,
					offset: offset || null,
					where: {
						name: {
							[Op.like]: `%${name}%`,
						},
					},
				});

				locationByName.length > 0
					? res.status(200).send({
							status: "success",
							message: "Get location by name successfully",
							data: locationByName,
					  })
					: res.status(404).send({
							status: "failed",
							message: "Location not found",
					  });
			} else if (priceFrom && priceTo) {
				const locationByPrice = await location.findAll({
					// pagination
					limit: limit || null,
					offset: offset || null,
					include: [
						{
							model: menu,
							attributes: {
								exclude: ["createdAt", "updatedAt"],
							},
							where: {
								price: {
									[Op.between]: [priceFrom, priceTo],
								},
							},
						},
					],
				});

				locationByPrice.length > 0
					? res.status(200).send({
							status: "success",
							message: "Get location by price successfully",
							data: locationByPrice,
					  })
					: res.status(404).send({
							status: "failed",
							message: "Location not found",
					  });
			} else if (facility) {
				const locationByFacility = await location.findAll({
					// pagination
					limit: limit || null,
					offset: offset || null,
					include: [
						{
							model: facility,
							attributes: {
								exclude: ["createdAt", "updatedAt"],
							},
							where: {
								facility: {
									[Op.like]: `%${facility}%`,
								},
							},
						},
					],
				});

				locationByFacility.length > 0
					? res.status(200).send({
							status: "success",
							message: "Get location by facility successfully",
							data: locationByFacility,
					  })
					: res.status(404).send({
							status: "failed",
							message: "Location not found",
					  });
			} else {
				res.status(400).send({
					status: "failed",
					message: "Bad Request",
				});
			}
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
	async updateLocation(req, res) {
		try {
			const { locationId } = req.params;
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
			const updateLocation = await location.update(
				{
					name,
					address,
					longitude,
					latitude,
					owner,
					galeryId,
					description,
					time,
				},
				{
					where: {
						locationId,
					},
				}
			);
			res.status(200).send({
				status: "success",
				message: "Update location successfully",
				data: updateLocation,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	},
	async deleteLocation(req, res) {
		try {
			const { locationId } = req.params;
			const { userId } = req.user;

			// delete galery
			const deleteGalery = await galery.destroy({
				where: {
					locationId,
				},
			});

			// delete menu
			const deleteMenu = await menu.destroy({
				where: {
					locationId,
				},
			});

			// delete review
			const deleteReview = await review.destroy({
				where: {
					locationId,
				},
			});

			// delete location and relation table
			const deleteLocation = await location.destroy({
				where: {
					locationId,
				},
			});

			res.status(200).send({
				message: "Delete location successfully",
				data: deleteLocation,
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
