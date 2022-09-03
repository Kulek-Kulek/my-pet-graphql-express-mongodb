const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petSchema = new Schema({
  petName: { type: String, required: true },
  health: { type: Number, required: true },
  petType: { type: Schema.Types.ObjectId, ref: "PetType" },
  user: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Pet", petSchema);
