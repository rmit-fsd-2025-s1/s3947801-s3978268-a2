import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Application } from "./Application";
import { User } from "./User";

@Entity()
export class LecturerSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, { nullable: false })
  application: Application;

  @ManyToOne(() => User, { nullable: false })
  lecturer: User; // Only users with accountType: "lecturer"

  @Column({ type: "text", nullable: true })
  comment: string;

  @Column()
  rank: string;

  @Column({ default: false })
  rejected: boolean;
}
