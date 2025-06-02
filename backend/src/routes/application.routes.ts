import { Router } from "express";
import { ApplicationController } from "../controller/ApplicationController";

const router = Router();
const appController = new ApplicationController();


router.get("/", async (req, res, next) => {
  try {
    await appController.getApplications(req, res);
  } catch (err) {
    next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    await appController.createApplication(req, res);
  } catch (err) {
    next(err);
  }
});

router.get("/user/:userId", async (req, res, next) => {
  try {
    await appController.getApplicationsByUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await appController.deleteApplication(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
