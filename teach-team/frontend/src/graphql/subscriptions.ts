import { gql } from "@apollo/client";

export const CANDIDATE_UNAVAILABLE_SUBSCRIPTION = gql`
  subscription {
    candidateUnavailable {
      id
      email
      blocked
    }
  }
`;
