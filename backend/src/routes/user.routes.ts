import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validateDto } from "../middlewares/validate";
import { CreateUserDTO } from "../dtos/create-user.dto";

export const router = Router();

const userController = new UserController();

router.post("/", validateDto(CreateUserDTO), (req, res, next) => {
    userController.create(req, res).catch(next);
  }
);