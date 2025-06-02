import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

/**
 * Controller for user-related operations:
 * - Sign up
 * - Login
 * - Get courses by user ID
 */
export class UserController {
  private userRepo = AppDataSource.getRepository(User);

  /**
   * Handles user registration (sign-up)
   */
  async create(req: Request, res: Response) {
    const user = this.userRepo.create(req.body as User);

    try {
      await this.userRepo.save(user);
    } catch (error) {
      return res.status(500).json({ message: "Error saving user", error });
    }

    const { password, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  }

  /**
   * Handles user login
   */
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await this.userRepo.findOneBy({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _pw, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  }


  async getCoursesByUser(req: Request, res: Response) {
    const userId = parseInt(req.query.userId as string);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ["courses"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(user.courses ?? []);
    } catch (error) {
      console.error("Error fetching courses for user:", error);
      return res.status(500).json({ message: "Error fetching user courses", error });
    }
  }
}
