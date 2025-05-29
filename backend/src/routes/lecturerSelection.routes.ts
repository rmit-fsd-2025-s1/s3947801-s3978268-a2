import { Router, Request, Response, NextFunction } from "express";
import { LecturerSelectionController } from "../controller/LecturerSelectionController";
import { validateDto } from "../middlewares/validate";
import { CreateLecturerSelectionDTO } from "../dtos/create-lecturerSelection.dto";

const router = Router();
const selectionController = new LecturerSelectionController();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  selectionController.getSelectionsByLecturer(req, res).catch(next);
});

router.post("/", validateDto(CreateLecturerSelectionDTO), (req: Request, res: Response, next: NextFunction) => {
  selectionController.upsertSelection(req, res).catch(next);
});

router.get("/pending", (req: Request, res: Response, next: NextFunction) => {
  selectionController.getPendingSelectionsByLecturer(req, res).catch(next);
});

export default router;
