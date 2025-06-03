import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LecturerSelection } from "../entity/LecturerSelection";
import { Application } from "../entity/Application";

export class VisualController {
  private selectionRepo = AppDataSource.getRepository(LecturerSelection);
  private applicationRepo = AppDataSource.getRepository(Application);

  // This method combines all three queries into one response for the frontend
  async getVisualStats(req: Request, res: Response) {
    try {
      // Find most chosen applicant by counting selection rows grouped by applicationId
      const mostChosenRaw = await this.selectionRepo
        .createQueryBuilder('selection')
        .select('selection.applicationId')
        .addSelect('COUNT(selection.applicationId)', 'count')
        .groupBy('selection.applicationId')
        .orderBy('count', 'DESC')
        .limit(1)
        .getRawOne();

      if (!mostChosenRaw) return res.status(404).json({ message: 'No applicants found' });

      // Fetch application and related user info (email)
      const mostChosenApp = await this.applicationRepo.findOne({
        where: { id: mostChosenRaw.selection_applicationId },
        relations: ['user'],
      });

      // Find least chosen applicant with count > 0
      const leastChosenRaw = await this.selectionRepo
        .createQueryBuilder('selection')
        .select('selection.applicationId')
        .addSelect('COUNT(selection.applicationId)', 'count')
        .groupBy('selection.applicationId')
        .having('count > 0')
        .orderBy('count', 'ASC')
        .limit(1)
        .getRawOne();

      // Fetch application and user info for least chosen
      const leastChosenApp = leastChosenRaw
        ? await this.applicationRepo.findOne({
            where: { id: leastChosenRaw.selection_applicationId },
            relations: ['user'],
          })
        : null;

      // Get applicants who have no selections
      const subQuery = this.selectionRepo
        .createQueryBuilder('selection')
        .select('selection.applicationId');

      const notChosenApps = await this.applicationRepo
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.user', 'user')
        .where(`app.id NOT IN (${subQuery.getQuery()})`)
        .getMany();

      // Respond with data formatted for frontend
      return res.json({
        mostChosen: {
          applicationId: mostChosenApp?.id,
          email: mostChosenApp?.user.email,
          count: parseInt(mostChosenRaw.count),
        },
        leastChosen: leastChosenApp
          ? {
              applicationId: leastChosenApp.id,
              email: leastChosenApp.user.email,
              count: parseInt(leastChosenRaw.count),
            }
          : null,
        notChosen: notChosenApps.map(app => ({
          applicationId: app.id,
          email: app.user.email,
        })),
      });
    } catch (error) {
      console.error("Error in getVisualStats:", error);
      return res.status(500).json({ message: 'Error fetching visual stats', error });
    }
  }
}
