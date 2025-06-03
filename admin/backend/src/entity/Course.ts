import { Entity, Column, PrimaryColumn, ManyToMany } from "typeorm";
import { User } from "./User";

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.courses)
  lecturers: User[];
}
