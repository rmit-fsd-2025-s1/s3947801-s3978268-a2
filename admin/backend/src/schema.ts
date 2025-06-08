import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    password: String!
    accountType: String!
    date_joined: String!
    blocked: Boolean!
  }

  type Course {
    id: ID!
    name: String!
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    users(accountType: String, blocked: Boolean): [User!]!
    courses: [Course!]!
    candidatesByCourse(courseId: ID!): [User!]!
    candidatesWithManyCourses(minCourses: Int!): [User!]!
    candidatesNotChosen: [User!]!
    lecturersByCourse(courseId: ID!): [User!]!
  }

type Mutation {
  assignLecturerToCourse(userId: ID!, courseId: ID!): Boolean!
  addCourse(id: ID!, name: String!): Course!
  editCourse(id: ID!, name: String!): Course!
  deleteCourse(id: ID!): Boolean!
  blockCandidate(userId: ID!, block: Boolean!): User!
  loginAdmin(email: String!, password: String!): AuthPayload!
}

  type Subscription {
    candidateUnavailable: User
  }
`;
