import db from './db';

export const resolvers = {
  Query: {
    users: async (_, args) => {
      let query = 'SELECT * FROM user WHERE 1=1';
      const params = [];

      if (args.accountType) {
        query += ' AND accountType = ?';
        params.push(args.accountType);
      }

      if (typeof args.blocked === 'boolean') {
        query += ' AND blocked = ?';
        params.push(args.blocked ? 1 : 0);
      }

      const [rows] = await db.query(query, params);
      return rows;
    },

    courses: async () => {
      const [rows] = await db.query('SELECT * FROM course');
      return rows;
    },

    candidatesByCourse: async (_, { courseId }) => {
      const [rows] = await db.query(
        `SELECT u.* FROM user u
        JOIN application a ON u.id = a.userId
        JOIN lecturer_selection ls ON a.id = ls.applicationId
        WHERE a.courseId = ? AND u.accountType = 'tutor'`,
        [courseId]
      );
      return rows;
    },

    candidatesWithManyCourses: async (_, { minCourses }) => {
      const [rows] = await db.query(
        `SELECT u.*, COUNT(DISTINCT a.courseId) as courseCount
        FROM user u
        JOIN application a ON u.id = a.userId
        JOIN lecturer_selection ls ON ls.applicationId = a.id
        WHERE u.accountType = 'tutor'
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
        WHERE u.accountType = 'tutor'
        AND NOT EXISTS (
        SELECT 1 FROM lecturer_selection ls WHERE ls.applicationId = a.id
        )`
      );
      return rows;
    },

    lecturersByCourse: async (_, { courseId }) => {
      const [rows] = await db.query(
        `
        SELECT u.* FROM user u
        JOIN user_courses_course uc ON u.id = uc.userId
        WHERE uc.courseId = ? AND u.accountType = 'lecturer'
      `,
        [courseId]
      );
      return rows;
    },
  },

  Mutation: {
    assignLecturerToCourse: async (_, { userId, courseId }) => {
      await db.query(
        'INSERT INTO user_courses_course (userId, courseId) VALUES (?, ?)',
        [userId, courseId]
      );
      return true;
    },

    addCourse: async (_, { id, name }) => {
      await db.query('INSERT INTO course (id, name) VALUES (?, ?)', [id, name]);
      return { id, name };
    },
    
    editCourse: async (_, { oldId, newId, name }) => {
      await db.query('UPDATE course SET id = ?, name = ? WHERE id = ?', [newId, name, oldId]);
      return { id: newId, name };
    },

    deleteCourse: async (_, { id }) => {
      await db.query(` DELETE ls FROM lecturer_selection ls
          JOIN application a ON ls.applicationId = a.id
          WHERE a.courseId = ?`, [id]);

      await db.query('DELETE FROM application WHERE courseId = ?', [id]);
      await db.query('DELETE FROM user_courses_course WHERE courseId = ?', [id]);
      await db.query('DELETE FROM course WHERE id = ?', [id]);
      return true;
    },

    blockCandidate: async (_, { userId, block }) => {
      await db.query('UPDATE user SET blocked = ? WHERE id = ?', [block ? 1 : 0, userId]);
      return true;
    },

    loginAdmin: async (_, { email, password }) => {
      const [rows]: any = await db.query(
        'SELECT * FROM user WHERE BINARY email = ? AND BINARY password = ? AND accountType = "admin"',
        [email, password]
      );

      if (rows.length === 1) {
        return { token: 'mock-admin-token-123' };
      }

      throw new Error('Invalid credentials');
    },
  },
};
