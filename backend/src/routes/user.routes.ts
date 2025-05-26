import { Router } from "express";
import { UserController } from "../controller/UserController";
import { validateDto } from "../middlewares/validate";
import { CreateUserDTO } from "../dtos/create-user.dto.ts";

const router = Router();

const userController = new UserController();

router.post("/", validateDto(CreateUserDTO), (req, res) =>
  userController.create(req, res)
);