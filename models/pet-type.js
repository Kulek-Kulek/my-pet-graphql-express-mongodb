const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petTypeSchema = new Schema({
  petTypeName: { type: String, required: true },
  properties: [{ type: Schema.Types.ObjectId, ref: "PetProperty" }],
});

module.exports = mongoose.model("PetType", petTypeSchema);
