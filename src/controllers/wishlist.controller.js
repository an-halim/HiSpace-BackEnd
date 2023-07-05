import { wishList, location, menu, galery, facility } from "../models/index.js";

const wishListController = {
	create: async (req, res) => {
		try {
			let { locationId } = req.body;
			const { userId } = req.user;
			const locationData = await location.findOne({
				where: {
					locationId,
				},
			});

			if (!locationData) {
				return res.status(404).json({
					status: "failed",
					message: "location not found",
				});
			}

			const data = {
				locationId: locationId,
				userUserId: userId,
				locationLocationId: locationId,
			};

			// prevent duplicate data
			const checkData = await wishList.findOne({
				where: {
					locationId,
					userUserId: userId,
				},
			});

			if (checkData) {
				return res.status(400).json({
					status: "failed",
					message: "location already in wishlist",
				});
			}

			const result = await wishList.create(data);

			if (result) {
				res.status(201).json({
					status: "success",
					data: result,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: "failed",
				message: err.message,
			});
		}
	},
	getAll: async (req, res) => {
		try {
			let page = Number(req?.query?.page) || 1;
			let limit = Number(req?.query?.limit) || 5;
			let offset = (page - 1) * limit;
			const { userId } = req.user;

			const result = await wishList.findAll({
				// pagination
				limit: limit || null,
				offset: offset || null,
				where: {
					userUserId: userId,
				},
				include: {
					model: location,
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
						{
							model: facility,
							attributes: ["facilityId", "name"],
						},
					],
				},
			});

			// only get location data that user has and remove null data
			const data = result
				.map((item) => item.location)
				.filter((item) => item !== null);

			res.status(200).json({
				status: "success",
				data: data,
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: "failed",
				message: err.message,
			});
		}
	},
	delete: async (req, res) => {
		try {
			const { locationId } = req.params;
			const { userId } = req.user;

			const locationData = await wishList.findOne({
				where: {
					locationLocationId: locationId,
					userUserId: userId,
				},
			});

			if (!locationData) {
				return res.status(404).json({
					status: "failed",
					message: "location not found",
				});
			}

			const result = await wishList.destroy({
				where: {
					locationLocationId: locationId,
					userUserId: userId,
				},
			});

			if (result) {
				res.status(200).json({
					status: "success",
					message: "successfully delete location from wishlist",
				});
			}
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: "failed",
				message: err.message,
			});
		}
	},
};

export default wishListController;
