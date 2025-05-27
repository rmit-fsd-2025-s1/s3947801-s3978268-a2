import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";

const router = Router();
const appController = new ApplicationController();

router.get("/", (req, res) => appController.getApplications(req, res));

export default router;
