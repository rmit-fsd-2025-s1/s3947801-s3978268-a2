import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($accountType: String, $blocked: Boolean) {
    users(accountType: $accountType, blocked: $blocked) {
      id
      password
      email
      accountType
      blocked
      date_joined
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
    }
  }
`;

export const ADD_COURSE = gql`
  mutation AddCourse($id: ID!, $name: String!) {
    addCourse(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const EDIT_COURSE = gql`
  mutation EditCourse($oldId: ID!, $newId: ID!, $name: String!) {
    editCourse(oldId: $oldId, newId: $newId, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const ASSIGN_LECTURER = gql`
  mutation AssignLecturerToCourse($userId: ID!, $courseId: ID!) {
    assignLecturerToCourse(userId: $userId, courseId: $courseId)
  }
`;

export const GET_LECTURERS_BY_COURSE = gql`
  query LecturersByCourse($courseId: ID!) {
    lecturersByCourse(courseId: $courseId) {
      id
      email
      accountType
    }
  }
`;

export const CANDIDATES_BY_COURSE = gql`
  query CandidatesByCourse($courseId: ID!) {
    candidatesByCourse(courseId: $courseId) {
      id
      email
    }
  }
`;

export const CANDIDATES_WITH_MANY_COURSES = gql`
  query {
    candidatesWithManyCourses(minCourses: 3) {
      id
      email
    }
  }
`;

export const CANDIDATES_NOT_CHOSEN = gql`
  query {
    candidatesNotChosen {
      id
      email
    }
  }
`;

