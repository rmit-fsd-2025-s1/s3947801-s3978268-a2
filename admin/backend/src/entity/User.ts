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
  accountType: "candidate" | "lecturer" | "admin";

  @Column({ default: false })
  blocked: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date_joined: Date;


  @ManyToMany(() => Course, (course) => course.lecturers)
  @JoinTable()
  courses: Course[];

   @OneToMany(() => Application, (application) => application.user)
  applications: Application[]; 
}
