const response = {
  success: (res, data) => {
    res.status(200).json({
      status: "success",
      data: data,
    });
  } ,
  failed: (res, err) => {
    res.status(422).json({
      status: "failed",
      errors: err,
    });
  },
  notFound: (res, err) => {
    res.status(404).json({
      status: "failed",
      errors: err,
    });
  },
  unauthorized: (res, err) => {
    res.status(401).json({
      status: "failed",
      errors: err,
    });
  },
  badRequest: (res, err) => {
    res.status(400).json({
      status: "failed",
      errors: err,
    })
  },
  forbiden: (res, err) => {
    res.status(403).json({
      status: "failed",
      errors: err,
    });
  },
  serverError: (res, err) => {
    res.status(500).json({
      status: "failed",
      errors: err,
    });
  },
  created: (res, data, message) => {
    res.status(201).json({
      status: "success",
      data: data,
      message: message,
    });
  },
}

export default response