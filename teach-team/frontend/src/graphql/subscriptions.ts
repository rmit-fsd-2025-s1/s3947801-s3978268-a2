import { gql } from "@apollo/client";

export const CANDIDATE_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription {
    candidateStatusChanged {
      id
      email
      blocked
    }
  }
`;
