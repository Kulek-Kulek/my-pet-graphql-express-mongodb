const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const PetType = require("../models/pet-type");
const PetProperty = require("../models/pet-property");
const Pet = require("../models/pet");
const HttpError = require("../models/error");

module.exports = {
  login: async ({ email, password }) => {
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Invalid email!" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 4 })
    ) {
      errors.push({ message: "Invalid password!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let user;
    try {
      user = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError("User not found", 500);
      throw error;
    }

    if (!user) {
      const error = new HttpError("User not found!", 401);
      throw error;
    }

    const passwordIsEqual = await bcrypt.compare(password, user.password);
    if (!passwordIsEqual) {
      const error = new HttpError("Invalid paswword.", 401);
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return {
      token,
      userId: user._id.toString(),
    };
  },

  createUser: async (args, _, next) => {
    const { email, firstName, lastName, password } = args.userInput;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Invalid email!" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 4 })
    ) {
      errors.push({ message: "Password too short!" });
    }
    if (
      !validator.isLength(lastName, { min: 3 }) &&
      !validator.isLength(firstName, { min: 3 })
    ) {
      errors.push({ message: "First name or last name is too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let userExists;
    try {
      userExists = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError("User not found", 500);
      throw error;
    }

    if (userExists) {
      const error = new HttpError("User with this email exists!", 422);
      throw error;
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError("I couldn't create this user.", 500);
      throw error;
    }

    const user = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    let createdUser;
    try {
      createdUser = await user.save();
    } catch (err) {
      const error = new HttpError(
        "I couldn't save this user in database!",
        500
      );
      throw error;
    }

    return { ...createdUser._doc, id: createdUser._id.toString() };
  },

  createPetType: async (args, _, next) => {
    const { petTypeName, properties } = args.petTypeInput;

    const errors = [];
    if (!Array.isArray(properties) || properties.length === 0) {
      errors.push({ message: "No pet properties provided!" });
    }

    if (
      validator.isEmpty(petTypeName) ||
      !validator.isLength(petTypeName, { min: 3 })
    ) {
      errors.push({ message: "Password too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let petTypeExists;
    try {
      petTypeExists = await PetType.findOne({ petTypeName: petTypeName });
    } catch (err) {
      const error = new HttpError("Pet type not found", 500);
      throw error;
    }

    if (petTypeExists) {
      const error = new HttpError("This kind of pet already exists.", 422);
      throw error;
    }

    const propertiesList = [];
    try {
      let prop;
      for (let id of properties) {
        prop = await PetProperty.findById(id);
        propertiesList.push(prop);
      }
    } catch (err) {
      const error = new HttpError("Could not find prop with this id.", 500);
      throw error;
    }

    const newPetType = new PetType({
      petTypeName,
      properties: propertiesList,
    });

    let createdNewPetType;
    try {
      createdNewPetType = await newPetType.save();
    } catch (err) {
      const error = new HttpError(
        "I couldn't save this pet type in database!",
        500
      );
      throw error;
    }

    return { ...createdNewPetType._doc, id: createdNewPetType._id.toString() };
  },

  createPetProperty: async (args, _, next) => {
    const { propName, propValue, propWeight, propValPerTime } =
      args.petPropInput;

    const errors = [];
    if (
      validator.isEmpty(propName) ||
      !validator.isLength(propName, { min: 3 })
    ) {
      errors.push({ message: "Property name is too short!" });
    }
    if (
      !validator.isNumeric(propValue) ||
      !validator.isLength(propValue, { min: 1, max: 1 })
    ) {
      errors.push({ message: "Property value must be a number from 0 to 9!" });
    }
    if (
      !validator.isNumeric(propWeight) ||
      !validator.isLength(propWeight, { min: 1, max: 1 })
    ) {
      errors.push({
        message: "Property weight must be a number from 0 to 9!!",
      });
    }
    if (!validator.isNumeric(propValPerTime)) {
      errors.push({ message: "Property value per time must be number!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let petPropExists;
    try {
      petPropExists = await PetProperty.findOne({ propName: propName });
    } catch (err) {
      const error = new HttpError("Property type not found", 500);
      throw error;
    }

    if (petPropExists) {
      const error = new HttpError(
        "This kind of pet property already exists.",
        422
      );
      throw error;
    }

    const petProp = new PetProperty({
      propName,
      propValue,
      propWeight,
      propValPerTime: propValPerTime,
    });

    let createdNewPetProp;
    try {
      createdNewPetProp = await petProp.save();
    } catch (err) {
      const error = new HttpError(
        "I couldn't save this pet property in database!",
        500
      );
      throw error;
    }

    return { ...createdNewPetProp._doc, id: createdNewPetProp._id.toString() };
  },

  addPetToUser: async (args, req, next) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const { petName, petTypeId } = args.addedPetDataInput;

    const errors = [];
    if (
      validator.isEmpty(petName) ||
      !validator.isLength(petName, { min: 3 })
    ) {
      errors.push({ message: "Pet name must be at least 3 letters long!" });
    }
    if (validator.isEmpty(petTypeId)) {
      errors.push({ message: "Invalid pet type id!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let petType;
    try {
      petType = await PetType.findById(petTypeId);
    } catch (err) {
      const error = new HttpError("I could not find this pet type.", 500);
      throw error;
    }

    if (!petType) {
      const error = new HttpError("This pet type does not exist.", 422);
      throw error;
    }

    let user;
    try {
      user = await User.findById(req.userId);
    } catch (err) {
      const error = new HttpError("I could not find this user.", 500);
      throw error;
    }

    if (!user) {
      const error = new HttpError("User does not exist.", 422);
      throw error;
    }

    const pet = new Pet({
      petName,
      petType,
      health: 100,
      user,
    });

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await pet.save({ session: sess });
      user.pets.push(pet);
      await user.save({ session: sess });
      pet.user.push(user);
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError("I could not save a new pet.", 500);
      throw error;
    }

    return { ...pet._doc, id: pet._id.toString() };
  },

  user: async (_, req, next) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    // let totalPets;
    // try {
    //   totalPets = await Pet.find().countDocuments();
    // } catch (err) {
    //   const error = new HttpError(
    //     "I could not retrieve total number of pets.",
    //     500
    //   );
    //   throw error;
    // }

    let user;
    try {
      user = await User.findById(req.userId).populate("pets");
    } catch (err) {
      const error = new HttpError("I could not find the user.", 500);
      throw error;
    }

    if (!user) {
      const error = new HttpError("User not found!", 422);
      throw error;
    }

    const pets = user._doc.pets.map((pet) => {
      return { ...pet._doc, id: pet._id.toString() };
    });
    console.log(pets);
    return { ...user._doc, id: user._id.toString() };
  },
};
