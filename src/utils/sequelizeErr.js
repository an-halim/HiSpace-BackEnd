let errorTracker = (err) => {
  let message = [];
  
  err.errors.forEach((error) => {
    switch (error.validatorKey) {
      case "isEmail":
        message.push("Please enter a valid email");
        break;
      case "isDate":
        message.push("Please enter a valid date");
        break;
      case "len":
        if (error.validatorArgs[0] === error.validatorArgs[1]) {
          message.push("Use " + error.validatorArgs[0] + " characters");
        } else {
          message.push(
            `Use ${error.path} between ` +
            error.validatorArgs[0] +
            " and " +
            error.validatorArgs[1] +
            " characters");
        }
        break;
      case "min":
        message.push("Use a number greater or equal to " + error.validatorArgs[0]);
        break;
      case "max":
        message.push("Use a number less or equal to " + error.validatorArgs[0]);
        break;
      case "isInt":
        message.push("Please use an integer number");
        break;
      case "is_null":
        message.push("Please complete this field");
        break;
      case "isIn":
        message.push("Please fill the field correctly");
        break;
      case "not_unique":
        message.push(error.value + " is taken. Please choose another one");
    }
  });
  console.log(message);
  return message[0];
};

export default errorTracker;