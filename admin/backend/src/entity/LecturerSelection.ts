import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Application } from "./Application";
import { User } from "./User";

@Entity()
export class LecturerSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, (app) => app.lecturerSelections)
  application: Application;

  @ManyToOne(() => User, { eager: true })
  lecturer: User;

  @Column({ nullable: true })
  rank: string;

  @Column({ nullable: true })
  comment: string;
}
