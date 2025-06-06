import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LecturerSelection } from "../entity/LecturerSelection";
import { Application } from "../entity/Application";
import { User } from "../entity/User";

export class VisualController {
  private selectionRepo = AppDataSource.getRepository(LecturerSelection);
  private applicationRepo = AppDataSource.getRepository(Application);
  private userRepo = AppDataSource.getRepository(User);

  // This method combines all three queries into one response for the frontend
  async getVisualStats(req: Request, res: Response) {
    try {
      // Find most chosen applicant by counting selection rows grouped by applicationId
      const mostChosenRaw = await this.selectionRepo
      .createQueryBuilder('selection')
      .select('app.userId', 'userId')
      .addSelect('COUNT(selection.id)', 'count')
      .innerJoin(Application, 'app', 'app.id = selection.applicationId')
      .groupBy('app.userId')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

      if (!mostChosenRaw) return res.status(404).json({ message: 'No applicants found' });

      // Fetch application and related user info (email)
      const mostChosenApp = await this.userRepo.findOne({
        where: { id: mostChosenRaw.userId },
      });

      // Find least chosen applicant with count > 0
      const leastChosenRaw = await this.selectionRepo
      .createQueryBuilder('selection')
      .select('app.userId', 'userId')
      .addSelect('COUNT(selection.id)', 'count')
      .innerJoin(Application, 'app', 'app.id = selection.applicationId')
      .groupBy('app.userId')
      .orderBy('count', 'ASC')
      .limit(1)
      .getRawOne();

      // Fetch application and user info for least chosen
      const leastChosenApp = leastChosenRaw
      ? await this.userRepo.findOne({ where: { id: leastChosenRaw.userId } })
      : null;

      // Get applicants who have no selections
      const subQuery = this.selectionRepo
        .createQueryBuilder('selection')
        .select('selection.applicationId');
      
      const notChosenCandidate = await this.userRepo
      .createQueryBuilder("user")
      .where("user.accountType = :type", { type: "candidate" })
      .andWhere(qb => {
        const sub = qb
        .subQuery()
        .select("app.userId")
        .from(Application, "app")
        .innerJoin("lecturer_selection", "ls", "ls.applicationId = app.id")
        .getQuery();
        return `user.id NOT IN ${sub}`;
      })
      .getMany();


      // Respond with data formatted for frontend
      return res.json({
        mostChosen: mostChosenApp
        ? {
          userId: mostChosenApp.id,
          email: mostChosenApp.email,
          count: parseInt(mostChosenRaw.count),
        }
        : null,
        leastChosen: leastChosenApp
        ? {
          userId: leastChosenApp.id,
          email: leastChosenApp.email,
          count: parseInt(leastChosenRaw.count),
        }
        : null,
        notChosen: notChosenCandidate.map(user => ({
          userId: user.id,
          email: user.email,
        })),
      });
    } catch (error) {
      console.error("Error in getVisualStats:", error);
      return res.status(500).json({ message: 'Error fetching visual stats', error });
    }
  }
}
