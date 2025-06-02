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

    try {
      const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
      const course = await AppDataSource.getRepository(Course).findOneBy({ id: courseId });

      if (!user || !course) {
        return res.status(404).json({ message: "User or Course not found" });
      }

      const application = this.applicationRepo.create({
        user,
        course,
        role,
        previousRole,
        availability,
        skills,
        academicCredentials,
        status: "Pending",
      });

      await this.applicationRepo.save(application);
      console.log("New application created:", application);

      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Error creating application", error });
    }
  }

  async getApplicationsByUser(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const { status, role } = req.query;

      const whereClause: any = {
        user: { id: userId },
      };

      if (status) {
        whereClause.status = String(status).trim();
      }
      if (role) {
        whereClause.role = String(role).trim();
      }      

      const applications = await this.applicationRepo.find({
        where: whereClause,
        relations: ["course", "user"],
      });


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


