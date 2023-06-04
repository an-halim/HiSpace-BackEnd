import db from "../database/index.js";
import user from "./user.js";
import location from "./location.js";
import randomId from "../utils/randomId.js"; 


const review = db.define("review", {
  reviewId: {
    type: db.Sequelize.UUID,
    defaultValue:() => {
      const random = new randomId(15);
      return random.generate();
    },
    primaryKey: true,
  },
  userId: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  locationId: {
    type: db.Sequelize.UUID,
    allowNull: false,
  },
  rating: {
    type: db.Sequelize.FLOAT,
    allowNull: true,
  },
  comment: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
}, {
  freezeTableName: true,
})

review.belongsTo(user);
user.hasMany(review);

review.belongsTo(location);
location.hasMany(review);

export default review;