import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { In } from "typeorm";
import { User } from "../entity/User";
import { Course } from "../entity/Course";

export class ApplicationController {
  private applicationRepo = AppDataSource.getRepository(Application);

  async getApplications(req: Request, res: Response) {
    const courseIdsParam = req.query.courseIds as string;
    let applications;

    try {
      if (courseIdsParam) {
        const courseIds = courseIdsParam.split(",");
        applications = await this.applicationRepo.find({
          where: { course: { id: In(courseIds) } },
          relations: ["user", "course"],
        });
      } else {
        applications = await this.applicationRepo.find({ relations: ["user", "course"] });
      }
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications", error });
    }
  }

  async createApplication(req: Request, res: Response) {
    const { userId, courseId, role, previousRole, availability, skills, academicCredentials } = req.body;

    if (!userId || !courseId || !role || !availability || !previousRole || !skills || !academicCredentials) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const validRoles = ["tutor", "lab assistant"];
    const validAvailability = ["Full-time", "Part-time"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided." });
    }

    if (!validAvailability.includes(availability)) {
      return res.status(400).json({ message: "Invalid availability provided." });
    }

    const wordLimit = 100;
    const checkWordCount = (text: string) =>
      text.trim().split(/\s+/).filter(Boolean).length <= wordLimit;

    if (
      !checkWordCount(previousRole) ||
      !checkWordCount(skills) ||
      !checkWordCount(academicCredentials)
    ) {
      return res.status(400).json({ message: "Each text field must be under 100 words." });
    }

    try {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
      const course = await AppDataSource.getRepository(Course).findOneBy({ id: courseId });

      if (!user || !course) {
        return res.status(404).json({ message: "User or Course not found." });
      }

      const existing = await this.applicationRepo.findOne({
        where: {
          user: { id: userId },
          course: { id: courseId },
        },
        relations: ["user", "course"],
      });

      if (existing) {
        return res.status(400).json({
          message: "You have already submitted an application for this course.",
        });
      }

      const application = this.applicationRepo.create({
        user,
        course,
        role,
        previousRole: previousRole.trim(),
        availability: availability.trim(),
        skills: skills.trim(),
        academicCredentials: academicCredentials.trim(),
        status: "Pending",
      });

      await this.applicationRepo.save(application);
      console.log("New application created:", application);

      res.status(201).json(application);
    } catch (error) {
      console.error("Server error while creating application:", error);
      res.status(500).json({ message: "Error creating application", error });
    }
  }

  async getApplicationsByUser(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      console.log("Fetching applications for userId:", userId);
      const { status, role } = req.query;

      const qb = this.applicationRepo
        .createQueryBuilder("application")
        .leftJoinAndSelect("application.user", "user")
        .leftJoinAndSelect("application.course", "course")
        .where("user.id = :userId", { userId });

      if (status) {
        qb.andWhere("application.status = :status", { status: String(status).trim() });
      }

      if (role) {
        qb.andWhere("application.role = :role", { role: String(role).trim() });
      }

      const applications = await qb.getMany();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications for user", error });
    }
  }

  async deleteApplication(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      const result = await this.applicationRepo.delete({ id });

      if (result.affected === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting application", error });
    }
  }
}
