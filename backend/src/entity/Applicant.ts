import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Applicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  tutorName: string;

  @Column()
  courseName: string;

  @Column({ nullable: true })
  previousRole: string;

  @Column({ nullable: true })
  availability: string;

  @Column({ type: "text", nullable: true })
  skills: string;

  @Column({ type: "text", nullable: true })
  academicCredentials: string;

  @Column({ nullable: true })
  status: string;
  
  @ManyToOne(() => User, { nullable: false })
  user: User;

}
