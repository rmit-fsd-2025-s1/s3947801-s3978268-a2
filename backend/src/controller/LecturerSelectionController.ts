import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LecturerSelection } from "../entity/LecturerSelection";
import { CreateLecturerSelectionDTO } from "../dtos/create-lecturerSelection.dto";
import { validate } from "class-validator";

export class LecturerSelectionController {
  private selectionRepo = AppDataSource.getRepository(LecturerSelection);

  async getSelectionsByLecturer(req: Request, res: Response) {
    const lecturerId = parseInt(req.query.lecturerId as string);

    if (isNaN(lecturerId)) {
      return res.status(400).json({ message: "Invalid lecturerId" });
    }

    try {
      const selections = await this.selectionRepo.find({
        where: { lecturer: { id: lecturerId } },
        relations: ["application", "application.user", "application.course", "lecturer"],
      });
      res.json(selections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching selections", error });
    }
  }

async upsertSelection(req: Request, res: Response) {
  const dto = new CreateLecturerSelectionDTO();
  Object.assign(dto, req.body);

  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  try {
    let selection = await this.selectionRepo.findOne({
      where: {
        application: { id: dto.applicationId },
        lecturer: { id: dto.lecturerId },
      },
      relations: ["application", "lecturer"],
    });

    if (selection) {
      selection.rank = dto.rank;
      selection.comment = dto.comment;
    } else {
      selection = this.selectionRepo.create({
        application: { id: dto.applicationId },
        lecturer: { id: dto.lecturerId },
        rank: dto.rank,
        comment: dto.comment,
      });
    }

    await this.selectionRepo.save(selection);
    res.json(selection);
  } catch (error) {
    res.status(500).json({ message: "Error saving selection", error });
  }
}
}
