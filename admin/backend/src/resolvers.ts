import { AppDataSource as db } from "./data-source";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { LecturerSelection } from "./entity/LecturerSelection";
import { pubsub } from "./pubsub";
import { In } from "typeorm";

export const resolvers = {
  Query: {
    users: async (_: any, args: { accountType?: string; blocked?: boolean }) => {
      const qb = db.getRepository(User).createQueryBuilder("user");

      if (args.accountType) {
        qb.andWhere("user.accountType = :accountType", { accountType: args.accountType });
      }

      if (typeof args.blocked === "boolean") {
        qb.andWhere("user.blocked = :blocked", { blocked: args.blocked });
      }

      return await qb.getMany();
    },

    courses: async () => {
      return await db.getRepository(Course).find({ relations: ["lecturers"] });
    },

    selectedCandidatesByCourse: async (_: any, { courseId }: { courseId: string }) => {
      const selections = await db
        .getRepository(LecturerSelection)
        .createQueryBuilder("selection")
        .leftJoinAndSelect("selection.application", "application")
        .leftJoinAndSelect("application.user", "user")
        .leftJoinAndSelect("application.course", "course")
        .where("course.id = :courseId", { courseId })
        .getMany();

      return selections.map((sel) => sel.application.user);
    },





    candidatesWithMoreThan3Selections: async () => {
      const subQuery = db
        .getRepository(LecturerSelection)
        .createQueryBuilder("selection")
        .innerJoin("selection.application", "application")
        .innerJoin("application.user", "user")
        .select("user.email", "email")
        .addSelect("COUNT(*)", "count")
        .groupBy("user.email")
        .having("COUNT(*) > 3");

      const rows = await subQuery.getRawMany();

      const emails = rows.map((r) => r.email);

      return db.getRepository(User).find({
        where: { email: In(emails) },
      });
    },


    candidatesNeverSelected: async () => {
      const allApplicants = await db.getRepository(User).find({
        where: { accountType: "candidate" },
        relations: ["applications"],
      });

      const selectedAppIds = new Set<number>();
      const selections = await db.getRepository(LecturerSelection).find({
        relations: ["application"],
      });
      selections.forEach((sel) => selectedAppIds.add(sel.application.id));

      const unselectedUsers = allApplicants.filter((user) =>
        user.applications.every((app) => !selectedAppIds.has(app.id))
      );

      return unselectedUsers;
    },

    lecturersByCourse: async (_: any, { courseId }: { courseId: string }) => {
      const course = await db.getRepository(Course).findOne({
        where: { id: courseId },
        relations: ["lecturers"],
      });
      return course?.lecturers || [];
    },

    debugCandidateCourses: async () => {
      const candidate = await db.getRepository(User).findOne({
        where: { email: "thisisatest@rmit.edu.vn" },
        relations: ["courses"],
      });
      console.log("DEBUG Candidate with courses:", candidate);
      if (!candidate) return "Candidate not found";
      return `${candidate.email} has ${candidate.courses.length} courses.`;
    },
  },

  Mutation: {
    assignLecturerToCourse: async (_: any, { userId, courseId }: { userId: number; courseId: string }) => {
      const courseRepo = db.getRepository(Course);
      const userRepo = db.getRepository(User);

      const course = await courseRepo.findOne({ where: { id: courseId }, relations: ["lecturers"] });
      const lecturer = await userRepo.findOne({ where: { id: userId } });

      if (course && lecturer) {
        course.lecturers.push(lecturer);
        await courseRepo.save(course);
      }
      return true;
    },

    unassignLecturerFromCourse: async (_: any, { userId, courseId }: { userId: number; courseId: string }) => {
      const courseRepo = db.getRepository(Course);
      const course = await courseRepo.findOne({ where: { id: courseId }, relations: ["lecturers"] });

      if (course && Array.isArray(course.lecturers)) {
        const originalLength = course.lecturers.length;
        course.lecturers = course.lecturers.filter((lec) => lec.id !== userId);

        if (course.lecturers.length !== originalLength) {
          await courseRepo.save(course);
        }
      }


      return true;
    },

    addCourse: async (_: any, { id, name }: { id: string; name: string }) => {
      const course = db.getRepository(Course).create({ id, name });
      await db.getRepository(Course).save(course);
      return course;
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
      await db.getRepository(Course).delete(id);
      return true;
    },

    blockCandidate: async (_: any, { userId, block }: { userId: string; block: boolean }) => {
      const userRepo = db.getRepository(User);
      const user = await userRepo.findOneBy({ id: parseInt(userId) });
      if (!user) throw new Error("User not found");

      user.blocked = block;
      await userRepo.save(user);

      await pubsub.publish("CANDIDATE_STATUS_CHANGED", {
        candidateStatusChanged: user,
      });

      return user;
    },

    loginAdmin: async (_: any, { email, password }: { email: string; password: string }) => {
      const userRepo = db.getRepository(User);
      const user = await userRepo.findOneBy({ email, password });
      if (user && user.accountType === "admin") {
        return { token: "mock-admin-token-123" };
      }
      throw new Error("Invalid credentials");
    },
  },

  Subscription: {
    candidateStatusChanged: {
      subscribe: () => pubsub.asyncIterableIterator("CANDIDATE_STATUS_CHANGED"),
    },
  },
};
