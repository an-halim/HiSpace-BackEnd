import location from "../models/location.js";

let seed = async () => {
	await location
		.bulkCreate([
			{
				name: "Kopi Kenangan",
				address: "Jl. Raya Pajajaran No. 1, Bogor, Jawa Barat",
				longitude: 106.795,
				latitude: -6.597,
				owner: "Kopi Kenangan",
				galeryId: "1",
				description:
					"Kopi Kenangan adalah sebuah perusahaan kopi asal Indonesia yang didirikan pada tahun 2017 oleh Edward Tirtanata dan James Prananto. Kopi Kenangan pertama kali didirikan di Jakarta, Indonesia. Kopi Kenangan memiliki 324 gerai di Indonesia.",
				time: "08.00 - 22.00",
				rating: 4.5,
				tags: "#outdor #enak #mantap",
			},
			{
				name: "Kopi kapal APi",
				address: "Jl. Raya Pajajaran No. 1, Bogor, Jawa Barat",
				longitude: 106.795,
				latitude: -6.597,
				owner: "Kopi kapal APi",
				galeryId: "1",
				description:
					"Kopi kapal APi adalah sebuah perusahaan kopi asal Indonesia yang didirikan pada tahun 2017 oleh Edward Tirtanata dan James Prananto. Kopi Kenangan pertama kali didirikan di Jakarta, Indonesia. Kopi Kenangan memiliki 324 gerai di Indonesia.",
				time: "08.00 - 22.00",
				rating: 4.5,
				tags: "#outdor",
			},
		])
		.then((result) => {
			console.log(result);
		});
};

export default seed;
