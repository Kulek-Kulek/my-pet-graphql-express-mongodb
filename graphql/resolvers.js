const mongoose = require("mongoose");
const User = require("../models/user");
const PetType = require("../models/pet-type");
const PetProperty = require("../models/pet-property");
const Pet = require("../models/pet");
const HttpError = require("../models/error");
const bcrypt = require("bcrypt");

module.exports = {
  hello() {
    return {
      text: "hello there",
      views: 123456789,
    };
  },

  createUser: async (args, _, next) => {
    const { email, firstName, lastName, password } = args.userInput;

    let userExists;
    try {
      userExists = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError("User not found", 500);
      return next(error);
    }

    if (userExists) {
      const error = new HttpError("User with this email exists!", 422);
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError("I couldn't create this user.", 500);
      return next(error);
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
      return next(error);
    }

    return { ...createdUser._doc, id: createdUser._id.toString() };
  },

  createPetType: async (args, _, next) => {
    const { petTypeName, properties } = args.petTypeInput;

    let petTypeExists;
    try {
      petTypeExists = await PetType.findOne({ petTypeName: petTypeName });
    } catch (err) {
      const error = new HttpError("Pet type not found", 500);
      return next(error);
    }

    if (petTypeExists) {
      const error = new HttpError("This kind of pet already exists.", 422);
      return next(error);
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
      return next(error);
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
      return next(error);
    }

    return { ...createdNewPetType._doc, id: createdNewPetType._id.toString() };
  },

  createPetProperty: async (args, _, next) => {
    const { propName, propValue, propWeight, propValPerTime } =
      args.petPropInput;

    let petPropExists;
    try {
      petPropExists = await PetProperty.findOne({ propName: propName });
    } catch (err) {
      const error = new HttpError("Property type not found", 500);
      return next(error);
    }

    if (petPropExists) {
      const error = new HttpError(
        "This kind of pet property already exists.",
        422
      );
      return next(error);
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
      return next(error);
    }

    return { ...createdNewPetProp._doc, id: createdNewPetProp._id.toString() };
  },

  addPetToUser: async (args, _, next) => {
    const { petName, petTypeId, userId } = args.addedPetDataInput;

    let petType;
    try {
      petType = await PetType.findById(petTypeId);
    } catch (err) {
      const error = new HttpError("I could not find this pet type.", 500);
      return next(error);
    }

    if (!petType) {
      const error = new HttpError("This pet type does not exist.", 422);
      return next(error);
    }

    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      const error = new HttpError("I could not find this user.", 500);
      return next(error);
    }

    if (!user) {
      const error = new HttpError("User does not exist.", 422);
      return next(error);
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
      console.log(err);
      const error = new HttpError("I could not save a new pet.", 500);
      return next(error);
    }

    return { ...pet._doc, id: pet._id.toString() };
  },
};
