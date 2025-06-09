import { Entity, Column, PrimaryColumn, ManyToMany, OneToMany } from "typeorm";
import { User } from "./User";
import { Application } from "./Application";

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.courses)
  lecturers: User[];

  @OneToMany(() => Application, (application) => application.course)
  applications: Application[]; 
}
