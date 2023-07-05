import formidable from "formidable";

export default (req, res, next) => {
	const form = formidable({ multiples: true });

	form.parse(req, (err, fields, files) => {
		if (err) {
			next(err);
			return;
		}

		// if file extension is not an image
		if (files.image) {
			// const extension = files.image.originalFilename
			// 	.split(".")[1]
			// 	.toLowerCase();
			// console.log(extension);

			// if (extension !== "png" && extension !== "jpg" && extension !== "jpeg") {
			// 	const error = {
			// 		message: "File type is not supported",
			// 		code: "UNSUPPORTED_FILE",
			// 	};
			// 	return res.status(400).json({
			// 		status: "failed",
			// 		error: error,
			// 	});
			// }
			// else if (files.image.size > 1000000) {
			// 	const error = {
			// 		message: "File size is too large",
			// 		code: "FILE_SIZE_TOO_LARGE",
			// 	};
			// 	return res.status(400).json({
			// 		status: "failed",
			// 		error: error,
			// 	});
			// }
			// else {
			req.body = fields;
			req.files = files;
			next();
			// }
		} else {
			req.body = fields;
			req.files = files;
			next();
		}
	});
};
