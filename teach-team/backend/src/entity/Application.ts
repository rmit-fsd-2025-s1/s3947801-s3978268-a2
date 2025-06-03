import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false }) 
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @Column({
    type: "enum",
    enum: ["tutor", "lab assistant"],
  })
  role: "tutor" | "lab assistant";

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

  @CreateDateColumn()
  createdAt: Date;
}
