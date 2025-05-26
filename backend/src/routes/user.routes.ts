import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validateDto } from "../middlewares/validate";
import { CreateUserDTO } from "../dtos/create-user.dto";
import { LoginUserDTO } from "../dtos/login-user.dto";

export const router = Router();

const userController = new UserController();

router.post("/", validateDto(CreateUserDTO), (req, res, next) => {
    userController.create(req, res).catch(next);
  }
);

router.post("/login", validateDto(LoginUserDTO), (req, res, next) => {
    userController.login(req, res).catch(next);
  }
); 
