// resolvers.ts
import db from "./db";
import { pubsub } from "./pubsub";

export const resolvers = {
  Query: {
    users: async (_: any, args: { accountType?: string; blocked?: boolean }) => {
      let query = "SELECT * FROM user WHERE 1=1";
      const params: any[] = [];

      if (args.accountType) {
        query += " AND accountType = ?";
        params.push(args.accountType);
      }

      if (typeof args.blocked === "boolean") {
        query += " AND blocked = ?";
        params.push(args.blocked ? 1 : 0);
      }

      const [rows] = await db.query(query, params);
      return rows;
    },

    courses: async () => {
      const [rows] = await db.query("SELECT * FROM course");
      return rows;
    },

    candidatesByCourse: async (_: any, { courseId }: { courseId: string }) => {
      const [rows] = await db.query(
        `SELECT u.* FROM user u
         JOIN application a ON u.id = a.userId
         JOIN lecturer_selection ls ON a.id = ls.applicationId
         WHERE a.courseId = ? AND u.accountType = 'candidate'`,
        [courseId]
      );
      return rows;
    },

    candidatesWithManyCourses: async (_: any, { minCourses }: { minCourses: number }) => {
      const [rows] = await db.query(
        `SELECT u.*, COUNT(DISTINCT a.courseId) as courseCount
         FROM user u
         JOIN application a ON u.id = a.userId
         JOIN lecturer_selection ls ON ls.applicationId = a.id
         WHERE u.accountType = 'candidate'
         GROUP BY u.id
         HAVING courseCount > ?`,
        [minCourses]
      );
      return rows;
    },

    candidatesNotChosen: async () => {
      const [rows] = await db.query(
        `SELECT DISTINCT u.*
         FROM user u
         JOIN application a ON u.id = a.userId
         WHERE u.accountType = 'candidate'
           AND u.id NOT IN (
             SELECT u2.id
             FROM user u2
             JOIN application a2 ON u2.id = a2.userId
             JOIN lecturer_selection ls ON ls.applicationId = a2.id
           )`
      );
      return rows;
    },

    lecturersByCourse: async (_: any, { courseId }: { courseId: string }) => {
      const [rows] = await db.query(
        `SELECT u.*
         FROM user u
         JOIN user_courses_course uc ON u.id = uc.userId
         WHERE uc.courseId = ? AND u.accountType = 'lecturer'`,
        [courseId]
      );
      return rows;
    },
  },

  Mutation: {
    assignLecturerToCourse: async (_: any, { userId, courseId }: { userId: number; courseId: string }) => {
      await db.query(
        "INSERT INTO user_courses_course (userId, courseId) VALUES (?, ?)",
        [userId, courseId]
      );
      return true;
    },

    addCourse: async (_: any, { id, name }: { id: string; name: string }) => {
      await db.query("INSERT INTO course (id, name) VALUES (?, ?)", [id, name]);
      return { id, name };
    },

    editCourse: async (_: any, { oldId, newId, name }: { oldId: string; newId: string; name: string }) => {
      await db.query("UPDATE course SET id = ?, name = ? WHERE id = ?", [newId, name, oldId]);
      return { id: newId, name };
    },

    deleteCourse: async (_: any, { id }: { id: string }) => {
      await db.query(
        `DELETE ls FROM lecturer_selection ls
         JOIN application a ON ls.applicationId = a.id
         WHERE a.courseId = ?`,
        [id]
      );
      await db.query("DELETE FROM application WHERE courseId = ?", [id]);
      await db.query("DELETE FROM user_courses_course WHERE courseId = ?", [id]);
      await db.query("DELETE FROM course WHERE id = ?", [id]);
      return true;
    },

    blockCandidate: async (_: any, { userId, block }: { userId: string; block: boolean }) => {
      const numericId = parseInt(userId, 10);  // 🔧 convert string to number

      await db.query("UPDATE user SET blocked = ? WHERE id = ?", [block ? 1 : 0, numericId]);

      const [rows]: any = await db.query("SELECT * FROM user WHERE id = ?", [numericId]);
      const updatedUser = rows[0];

      if (block) {
        await pubsub.publish("CANDIDATE_UNAVAILABLE", {
          candidateUnavailable: updatedUser,
        });
      }

      return updatedUser;
    },



    loginAdmin: async (_: any, { email, password }: { email: string; password: string }) => {
      const [rows]: any = await db.query(
        'SELECT * FROM user WHERE BINARY email = ? AND BINARY password = ? AND accountType = "admin"',
        [email, password]
      );

      if (rows.length === 1) {
        return { token: "mock-admin-token-123" };
      }

      throw new Error("Invalid credentials");
    },
  },

  Subscription: {
    candidateUnavailable: {
      subscribe: () => pubsub.asyncIterableIterator("CANDIDATE_UNAVAILABLE"),
    },
  },

};
