import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Course } from "./Course";
import { Application } from "./Application";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  accountType: "lecturer" | "candidate" | "admin";

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date_joined: string;

  @Column({ default: false })
  blocked: boolean;

  @ManyToMany(() => Course, course => course.lecturers)
  @JoinTable() 
  courses: Course[];

  @OneToMany(() => Application, app => app.user)
  applications: Application[];
}
