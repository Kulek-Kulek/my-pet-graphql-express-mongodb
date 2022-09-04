const { buildSchema } = require("graphql");

module.exports = buildSchema(`
 
    input UserInputData {
        email: String!
        firstName: String!
        lastName: String!
        password: String!
    }

    input PetPropInputData {
        propName: String!
        propValue: String!
        propWeight: String!
        propValPerTime: String!
    }

    input PetTypeInputData {
        petTypeName: String!
        properties: [ID!]!
    }

    input addedPetInputData {
        petName: String!
        petTypeId: ID!
        userId: ID!
    }

    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        pets: [Pet!]!
    }

    type PetType {
        id: ID!
        petTypeName: String!
        properties: [PetProperty!]!
    }

    type Pet {
        _id: ID!,
        name: String!
        health: Int!
        user: User!
    }

    type PetProperty {
        _id: ID!
        propName: String!
        propValue: String!
        propWeight: String!
        propValPerTime: String!
    }

    type addedPet {
        _id: ID!
        petName: String!
        petType: PetType!
        health: Int!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPetType(petTypeInput: PetTypeInputData!): PetType!
        createPetProperty(petPropInput: PetPropInputData): PetProperty!
        addPetToUser(addedPetDataInput: addedPetInputData): addedPet!
    }

    type RootQuery {
        login(email:String!, password: String!): AuthData!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
