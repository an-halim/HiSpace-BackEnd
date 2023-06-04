import db from "../database/index.js";
import location from "./location.js";
import randomId from "../utils/randomId.js";

const random = new randomId(15)

const facility = db.define("facility", {
  facilityId: {
    type: db.Sequelize.UUID,
    defaultValue: () => {
      const random = new randomId(15);
      return random.generate();
    },
    primaryKey: true,
  },
  locationId: {
    type: db.Sequelize.UUID,
    allowNull: false,
  },
  name: {
    type: db.Sequelize.STRING,
    allowNull: false,
  }

}, {
  freezeTableName: true,
})

facility.belongsTo(location);
location.hasMany(facility);

export default facility;