import db from "../database/index.js";


const review = db.define("review", {
  reviewId: {
    type: db.Sequelize.UUID,
    defaultValue: db.Sequelize.UUIDV4,
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

export default review;