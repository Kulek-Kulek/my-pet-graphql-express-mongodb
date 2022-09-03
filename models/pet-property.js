const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petPropertySchema = new Schema({
  propName: { type: String, required: true },
  propValue: { type: String, required: true },
  propWeight: { type: String, required: true },
  propValPerTime: { type: String, required: true },
});

module.exports = mongoose.model("PetProperty", petPropertySchema);
