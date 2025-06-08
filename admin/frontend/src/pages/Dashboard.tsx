import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_USERS } from "../graphql/queries";
import styles from "../styles/Dashboard.module.css";

const BLOCK_CANDIDATE = gql`
  mutation BlockCandidate($userId: ID!, $block: Boolean!) {
    blockCandidate(userId: $userId, block: $block) {
      id
      email
      blocked
    }
  }
`;


export default function Dashboard() {
  const [filterRole, setFilterRole] = useState("");
  const [filterBlocked, setFilterBlocked] = useState("");

  const parsedBlocked = filterBlocked === "" ? undefined : filterBlocked === "true";

  const filterVars = {
    accountType: filterRole || undefined,
    blocked: parsedBlocked,
  };

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: filterVars,
    fetchPolicy: "network-only",
  });

  const [blockCandidate] = useMutation(BLOCK_CANDIDATE);

const handleBlockToggle = async (id: number, currentlyBlocked: boolean) => {
  try {
    const res = await blockCandidate({
      variables: {
        userId: id.toString(),
        block: !currentlyBlocked,
      },
    });
    console.log("Mutation response:", res);
    await refetch({
      accountType: filterRole || undefined,
      blocked: parsedBlocked,
    });
  } catch (error: any) {
    console.error("Block mutation failed:", error);
    if (error.networkError?.result?.errors) {
      console.error("GraphQL Errors:", error.networkError.result.errors);
    }
  }
};


  const dateFormatter = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={styles["dashboard-container"]}>
      <header className={styles["dashboard-header"]}>
        <h1 className={styles["dashboard-title"]}>Admin Dashboard</h1>
      </header>

      <div className={styles["dashboard-filters"]}>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className={styles["filter-dropdown"]}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Lecturer</option>
          <option value="candidate">Candidate</option>
        </select>

        <select
          value={filterBlocked}
          onChange={(e) => setFilterBlocked(e.target.value)}
          className={styles["filter-dropdown"]}
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className={styles["error-message"]}>Error fetching users: {error.message}</p>}

      <table className={styles["dashboard-table"]}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Password</th>
            <th>Email</th>
            <th>Account Type</th>
            <th>Date Joined</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.users?.map((user: any) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.password}</td>
              <td>{user.email}</td>
              <td>{user.accountType}</td>
              <td>{dateFormatter.format(Number(user.date_joined))}</td>
              <td>{user.blocked ? "Blocked" : "Active"}</td>
              <td>
                <button
                  className={`${styles["block-btn"]} ${user.blocked ? styles["unblock-btn"] : ""}`}
                  onClick={() => handleBlockToggle(user.id, user.blocked)}
                >
                  {user.blocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
