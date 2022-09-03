const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
});

module.exports = mongoose.model("User", userSchema);
