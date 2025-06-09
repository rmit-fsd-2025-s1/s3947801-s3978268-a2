import {
  Entity,
  Column,
  PrimaryColumn,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  // Lecturers assigned to this course
  @ManyToMany(() => User, user => user.courses)
  @JoinTable()
  lecturers: User[];
}
