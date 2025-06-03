import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

export class CourseController {
  async getAll(req: Request, res: Response) {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      const courses = await courseRepo.find();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses", error });
    }
  }
}
