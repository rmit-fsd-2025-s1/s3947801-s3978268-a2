import { Router } from "express";
import { CourseController } from "../controller/CourseController";

const router = Router();
const controller = new CourseController();

router.get("/", controller.getAll.bind(controller)); 

export default router;
