import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

/**
 * Creates a new user record (sign-up)
 * @param req - Express request object containing user data in body
 * @param res - Express response object
 * @returns JSON object of the created user with 201 status
 */
export class UserController {
  /** Repository instance for database operations on Pet entity */
  private userRepo = AppDataSource.getRepository(User);

  async create(req: Request, res: Response) {
    // Create a new user object from the request body
    const user = this.userRepo.create(req.body);

    // Save the new user to the database
    try {
      await this.userRepo.save(user);
    } catch (error) {
      // For duplicate emails or other DB errors
      return res.status(500).json({ message: "Error saving user", error });
    }

    // NEVER return the password field in the response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }
}
