import {
	location,
	review,
	user,
	menu,
	galery,
	facility,
	wishList,
} from "../models/index.js";
import { Op } from "sequelize";
import sequelize from "sequelize";
import cloudinary from "../services/cloudinary.js";
import { calculateDistance } from "../utils/index.js";

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
			console.log(error.message);
			res.status(500).send({
				message: error,
			});
		}
	},
	async addGalery(req, res) {
		try {
			const { locationId } = req.params;
			const { email } = req.user;

			const owner = await location.findOne({
				where: {
					locationId,
					ownerEmail: email,
				},
			});

			if (!owner) {
				return res.status(400).send({
					status: "failed",
					message: "You are not the owner of this location",
				});
			}

			let uploadResult = [];

			for (let key in req.files) {
				const image = req.files[key];
				await cloudinary.uploader.upload(image.filepath).then((result) => {
					uploadResult.push(result.secure_url);
				});
			}

			const addGalery = await galery.create({
				locationId,
				locationLocationId: locationId,
				imageUrl,
			});
			res.status(201).send({
				status: "success",
				message: "Galery successfully created",
				data: addGalery,
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
		let page = Number(req?.query?.page) || 1;
		let limit = Number(req?.query?.limit) || 5;
		let offset = (page - 1) * limit;
		const { longitude, latitude } = req.query;
		const { sortBy } = req.query;
		const { userId } = req.user;

		if (sortBy) {
			switch (sortBy) {
				case "rating":
					const sortByRating = await location.findAll({
						// pagination
						limit: limit || null,
						offset: offset || null,
						include: [
							{
								model: wishList,
								attributes: [],
							},
							{
								model: menu,
								attributes: ["menuId", "name", "price"],
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
						],
						order: [["rating", "DESC"]],
					});

					// remove location with 0 rating
					const removeZeroRating = sortByRating.filter(
						(item) => item.rating !== 0 && item.rating !== null
					);

					const priceFrom = removeZeroRating.map((item) => {
						try {
							const menu = item.menus.sort((a, b) => {
								return a.price - b.price;
							});

							item.startFrom = `${menu[0].price} - ${
								menu[menu.length - 1].price
							}`;
							return item;
						} catch (err) {
							item.startFrom = 0;
							return item;
						}
					});

					res.status(200).send({
						status: "success",
						message: "Get all location by rating successfully",
						data: priceFrom,
					});
					break;
					// case "price":
					const sortByPrice = await location.findAll({
						// pagination
						limit: limit || null,
						offset: offset || null,
						include: [
							{
								model: wishList,
								attributes: [],
							},
							{
								model: menu,
								attributes: ["menuId", "name", "price"],
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
						],
						order: [["price", "DESC"]],
					});
				// res.status(200).send({
				// 	status: "success",
				// 	message: "Get all location successfully",
				// 	data: sortByPrice,
				// });
				// break;
				case "favorite":
					// grouping favorite by location
					const groupFavorite = await wishList.findAll({
						attributes: [
							"locationId",
							[sequelize.fn("COUNT", sequelize.col("locationId")), "count"],
						],
						group: ["locationId"],
						order: [[sequelize.literal("count"), "DESC"]],
					});

					// get location data
					const locationData = await location.findAll({
						// pagination
						limit: limit || null,
						offset: offset || null,
						include: [
							{
								model: wishList,
								attributes: [],
								where: {
									locationId: groupFavorite.map(
										(item) => item.dataValues.locationId
									),
								},
							},
							{
								model: menu,
								attributes: ["menuId", "name", "price"],
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
						],
					});

					locationData.map((item) => {
						groupFavorite.map((favorite) => {
							if (item.locationId === favorite.dataValues.locationId) {
								item.dataValues.favorite = favorite.dataValues.count;
							}
						});
					});

					res.status(200).send({
						status: "success",
						message: "Get all location by favorite successfully",
						data: locationData,
					});

					break;
				case "recommended":
					// grouping favorite by location from zero
					const favorite = await wishList.findAll({
						attributes: [
							"locationId",
							[sequelize.fn("COUNT", sequelize.col("locationId")), "count"],
						],
						group: ["locationId"],
						order: [[sequelize.literal("count"), "DESC"]],
					});

					// get location data
					const locations = await location.findAll({
						// pagination
						limit: limit || null,
						offset: offset || null,
						include: [
							{
								model: wishList,
								attributes: [],
								// where: {
								// 	locationId: favorite.map(
								// 		(item) => item.dataValues.locationId
								// 	),
								// },
							},
							{
								model: menu,
								attributes: ["menuId", "name", "price"],
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
						],
						order: [["rating", "DESC"]],
					});

					locations.map((item) => {
						favorite.map((favorite) => {
							if (item.locationId === favorite.dataValues.locationId) {
								item.dataValues.favorite = favorite.dataValues.count;
							} else {
								item.dataValues.favorite = 0;
							}
						});
					});

					const nearestLocation = locations.map((item) => {
						return {
							...item.dataValues,
							distance: calculateDistance(
								latitude,
								longitude,
								item.dataValues.latitude,
								item.dataValues.longitude
							),
						};
					});

					// get location about 20km from user
					const nearestLocationFilter = nearestLocation.filter(
						(item) => item.distance <= 20
					);

					// sort location order by open to close for user timezone
					// time format {"monday":{"open":"08:45","close":"00:00"},"tuesday":null,"wednesday":null,"thursday":null,"friday":null,"saturday":null,"sunday":null}'
					const days = [
						"sunday",
						"monday",
						"tuesday",
						"wednesday",
						"thursday",
						"friday",
						"saturday",
					];
					const day = days[new Date().getDay()];
					const timeNow = new Date().toLocaleTimeString("en-US", {
						hour12: false,
						hour: "numeric",
						minute: "numeric",
					});

					// check if at this time location is open
					const openLocation = nearestLocationFilter.map((item) => {
						try {
							const time = JSON.parse(item.time);
							if (time[day].open < timeNow && time[day].close < timeNow) {
								return {
									...item,
									isOpen: true,
								};
							} else {
								return {
									...item,
									isOpen: false,
								};
							}
						} catch (error) {
							return {
								...item,
								isOpen: false,
							};
						}
					});

					// sort location order by open to close for user timezone
					const openLocationSort = openLocation.sort((a, b) => {
						return a.isOpen - b.isOpen;
					});

					// add field menu startFrom: "lowest price menu to highest price menu"
					openLocationSort.map((item) => {
						try {
							const menu = item.menus.sort((a, b) => {
								return a.price - b.price;
							});
							// convert price to string format K
							item.startFrom = `${menu[0].price} - ${
								menu[menu.length - 1].price
							}`;
						} catch (err) {
							item.startFrom = 0;
						}
					});

					// check if on wishlist
					const wish = await wishList.findAll({
						where: {
							userUserId: userId,
						},
					});

					openLocationSort.map((item) => {
						wish.map((wish) => {
							if (item.locationId === wish.locationId) {
								return (item.isWish = true);
							} else {
								return (item.isWish = false);
							}
						});
					});

					res.status(200).send({
						status: "success",
						message: "Get all recomended location successfully",
						data: openLocationSort,
					});
					break;
				default:
					res.status(400).send({
						status: "failed",
						message: "Bad Request",
					});
					break;
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

				const days = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];
				const day = days[new Date().getDay()];
				const timeNow = new Date().toLocaleTimeString("en-US", {
					hour12: false,
					hour: "numeric",
					minute: "numeric",
				});

				// check if at this time location is open
				allLocation.map((item) => {
					try {
						const time = JSON.parse(item.time);
						if (time[day].open < timeNow && time[day].close < timeNow) {
							return {
								...item,
								isOpen: true,
							};
						} else {
							return {
								...item,
								isOpen: false,
							};
						}
					} catch (error) {
						return {
							...item,
							isOpen: false,
						};
					}
				});

				// add field menu startFrom: "lowest price menu to highest price menu"
				allLocation.map((item) => {
					try {
						const menu = item.menus.sort((a, b) => {
							return a.price - b.price;
						});
						// convert price to string format K
						// change if 1000 to 1k
						return (item.startFrom = `${menu[0].price} - ${
							menu[menu.length - 1].price
						}`);
					} catch (err) {
						return (item.startFrom = 0);
					}
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
								"updatedAt",
								"userUserId",
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
							exclude: [
								"createdAt",
								"updatedAt",
								"locationId",
								"locationLocationId",
							],
						},
					},
					{
						model: user,
						attributes: ["userId", "fullName", "email", "profilePic"],
					},
				],
			});

			await user
				.findAll({
					where: {
						userId: {
							[Op.in]: locationById.reviews.map((item) => item.userId),
						},
					},
				})
				.then((result) => {
					locationById.reviews.map((item) => {
						let user = result.find((user) => user.userId === item.userId);
						// replace password
						user = {
							userId: user.userId,
							fullName: user.fullName,
							email: user.email,
							profilePic: user.profilePic,
						};
						return (item.dataValues.user = user);
					});
				});

			res.status(200).send({
				status: "success",
				message: "Get location by id successfully",
				data: locationById,
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				message: error.message,
			});
		}
	},
	async getLocationByOwner(req, res) {
		try {
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
							model: user,
							attributes: ["fullName", "email", "profilepic"],
						},
					],
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

				const days = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];
				const day = days[new Date().getDay()];
				const timeNow = new Date().toLocaleTimeString("en-US", {
					hour12: false,
					hour: "numeric",
					minute: "numeric",
				});

				// check if at this time location is open
				locationByLocation.map((item) => {
					try {
						const time = JSON.parse(item.time);
						if (time[day].open < timeNow && time[day].close < timeNow) {
							return {
								...item,
								isOpen: true,
							};
						} else {
							return {
								...item,
								isOpen: false,
							};
						}
					} catch (error) {
						return {
							...item,
							isOpen: false,
						};
					}
				});

				// add field menu startFrom: "lowest price menu to highest price menu"
				locationByLocation.map((item) => {
					try {
						const menu = item.menus.sort((a, b) => {
							return a.price - b.price;
						});
						// convert price to string format K
						// change if 1000 to 1k
						return (item.startFrom = `${menu[0].price} - ${
							menu[menu.length - 1].price
						}`);
					} catch (err) {
						return (item.startFrom = 0);
					}
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

				if (locationByName.length === 0) {
					return res.status(404).send({
						status: "failed",
						message: "Location not found",
					});
				}

				const days = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];
				const day = days[new Date().getDay()];
				const timeNow = new Date().toLocaleTimeString("en-US", {
					hour12: false,
					hour: "numeric",
					minute: "numeric",
				});

				// check if at this time location is open
				locationByName.map((item) => {
					try {
						const time = JSON.parse(item.time);
						if (time[day].open < timeNow && time[day].close < timeNow) {
							return {
								...item,
								isOpen: true,
							};
						} else {
							return {
								...item,
								isOpen: false,
							};
						}
					} catch (error) {
						return {
							...item,
							isOpen: false,
						};
					}
				});

				// add field menu startFrom: "lowest price menu to highest price menu"
				locationByName.map((item) => {
					try {
						const menu = item.menus.sort((a, b) => {
							return a.price - b.price;
						});
						// convert price to string format K
						// change if 1000 to 1k
						return (item.startFrom = `${menu[0].price} - ${
							menu[menu.length - 1].price
						}`);
					} catch (err) {
						return (item.startFrom = 0);
					}
				});

				res.status(200).send({
					status: "success",
					message: "Get location by name successfully",
					data: locationByName,
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
					],
				});

				const days = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];
				const day = days[new Date().getDay()];
				const timeNow = new Date().toLocaleTimeString("en-US", {
					hour12: false,
					hour: "numeric",
					minute: "numeric",
				});

				// check if at this time location is open
				locationByPrice.map((item) => {
					try {
						const time = JSON.parse(item.time);
						if (time[day].open < timeNow && time[day].close < timeNow) {
							return {
								...item,
								isOpen: true,
							};
						} else {
							return {
								...item,
								isOpen: false,
							};
						}
					} catch (error) {
						return {
							...item,
							isOpen: false,
						};
					}
				});

				// add field menu startFrom: "lowest price menu to highest price menu"
				locationByPrice.map((item) => {
					try {
						const menu = item.menus.sort((a, b) => {
							return a.price - b.price;
						});
						// convert price to string format K
						// change if 1000 to 1k
						return (item.startFrom = `${menu[0].price} - ${
							menu[menu.length - 1].price
						}`);
					} catch (err) {
						return (item.startFrom = 0);
					}
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
						// if name or priceFrom and priceTo is not null
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${name}%`,
								},
							},
							{
								[Op.and]: [
									{
										"$menus.price$": {
											[Op.between]: [priceFrom, priceTo],
										},
									},
								],
							},
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

				const days = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];
				const day = days[new Date().getDay()];
				const timeNow = new Date().toLocaleTimeString("en-US", {
					hour12: false,
					hour: "numeric",
					minute: "numeric",
				});

				// check if at this time location is open
				locationByLocation.map((item) => {
					try {
						const time = JSON.parse(item.time);
						if (time[day].open < timeNow && time[day].close < timeNow) {
							return {
								...item,
								isOpen: true,
							};
						} else {
							return {
								...item,
								isOpen: false,
							};
						}
					} catch (error) {
						return {
							...item,
							isOpen: false,
						};
					}
				});

				// add field menu startFrom: "lowest price menu to highest price menu"
				locationByLocation.map((item) => {
					try {
						const menu = item.menus.sort((a, b) => {
							return a.price - b.price;
						});
						// convert price to string format K
						// change if 1000 to 1k
						return (item.startFrom = `${menu[0].price} - ${
							menu[menu.length - 1].price
						}`);
					} catch (err) {
						return (item.startFrom = 0);
					}
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
			const { name, address, longitude, latitude, description, time } =
				req.body;
			const { locationId } = req.params;
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
				.update(
					{
						name,
						address,
						longitude,
						latitude,
						owner: owner.fullName,
						ownerEmail: owner.email,
						userUserId: owner.userId,
						description,
						time,
					},
					{
						where: {
							locationId,
							userUserId: owner.userId,
						},
					}
				)
				.then(async (result) => {
					// delete old image
					await galery.destroy({
						where: {
							locationId,
						},
					});

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
					if (result[0]) {
						res.status(200).send({
							status: "success",
							message: "Location successfully updated",
						});
					} else {
						res.status(404).send({
							status: "failed",
							message: "Location not found",
						});
					}
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

			// delete wishlist
			const deleteWishlist = await wishList.destroy({
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
				message:
					deleteLocation > 0
						? "Delete location successfully"
						: "Location not found",
				data: deleteLocation > 0 ? deleteLocation : null,
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
