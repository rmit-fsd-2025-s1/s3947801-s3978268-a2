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
      return db.query(query, params);
    },

    courses: async () => {
      return db.query('SELECT * FROM course');
    },

    candidatesByCourse: async (_, { courseId }) => {
      return db.query(`
        SELECT u.* FROM user u
        JOIN user_courses_course uc ON u.id = uc.userId
        WHERE uc.courseId = ? AND u.accountType = 'candidate'
      `, [courseId]);
    },

    candidatesWithManyCourses: async (_, { minCourses }) => {
      return db.query(`
        SELECT u.*, COUNT(uc.courseId) as courseCount FROM user u
        JOIN user_courses_course uc ON u.id = uc.userId
        WHERE u.accountType = 'candidate'
        GROUP BY u.id
        HAVING courseCount > ?
      `, [minCourses]);
    },

    candidatesNotChosen: async () => {
      return db.query(`
        SELECT * FROM user u
        WHERE u.accountType = 'candidate'
          AND NOT EXISTS (
            SELECT 1 FROM user_courses_course uc WHERE uc.userId = u.id
          )
      `);
    }
  },

  Mutation: {
    assignLecturerToCourse: async (_, { userId, courseId }) => {
      // Check if user is lecturer etc. (optional)
      await db.query('INSERT INTO user_courses_course (userId, courseId) VALUES (?, ?)', [userId, courseId]);
      return true;
    },

    addCourse: async (_, { id, name }) => {
      await db.query('INSERT INTO course (id, name) VALUES (?, ?)', [id, name]);
      return { id, name };
    },

    editCourse: async (_, { id, name }) => {
      await db.query('UPDATE course SET name = ? WHERE id = ?', [name, id]);
      return { id, name };
    },

    deleteCourse: async (_, { id }) => {
      await db.query('DELETE FROM course WHERE id = ?', [id]);
      return true;
    },

    blockCandidate: async (_, { userId, block }) => {
      await db.query('UPDATE user SET blocked = ? WHERE id = ?', [block ? 1 : 0, userId]);
      return true;
    }
  }
};
