import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entity/Application";
import { In } from "typeorm";

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
}
