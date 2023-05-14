import db from "../database/index.js";
import Conversation from "./coversation.js";

const Chat = db.define("chat", {
  id: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  conversation_id: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
  },
  sender_id: {
    type: db.Sequelize.INTEGER,
    allowNull: false,
  },
  message: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  attachement: {
    type: db.Sequelize.STRING,
    allowNull: true,
  },
  is_read: {
    type: db.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Chat.belongsTo(Conversation, {
  foreignKey: "conversation_id",
  as: "conversation",
});

export default Chat;