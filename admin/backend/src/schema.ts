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
    lecturers: [User!]!
  }

  type Application {
  id: ID!
  user: User
  course: Course
  role: String!
  previousRole: String!
  availability: String!
  skills: String!
  academicCredentials: String!
  status: String!
}

  type AuthPayload {
    token: String!
  }

  type Query {
    users(accountType: String, blocked: Boolean): [User!]!
    courses: [Course!]!
    selectedCandidatesByCourse(courseId: ID!): [User!]!
  candidatesWithMoreThan3Selections: [User!]!
  candidatesNeverSelected: [User!]!
    candidatesByCourse(courseId: ID!): [User!]!
    candidatesWithManyCourses(minCourses: Int!): [User!]!
    candidatesNotChosen: [User!]!
    lecturersByCourse(courseId: ID!): [User!]!
    debugCandidateCourses: [User!]!  
    
  }

  type Mutation {
    assignLecturerToCourse(userId: ID!, courseId: ID!): Boolean!
    unassignLecturerFromCourse(userId: Int!, courseId: String!): Boolean!
    addCourse(id: ID!, name: String!): Course!
    editCourse(id: ID!, name: String!): Course!
    deleteCourse(id: ID!): Boolean!
    blockCandidate(userId: ID!, block: Boolean!): User!
    loginAdmin(email: String!, password: String!): AuthPayload!
  }

  type Subscription {
    candidateStatusChanged: User
  }
    
  type LecturerSelection {
  id: ID!
  lecturer: User!
  application: Application!
  rank: String
  comment: String
}

`;
