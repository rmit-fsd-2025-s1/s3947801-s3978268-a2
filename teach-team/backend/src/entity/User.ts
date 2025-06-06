import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Course } from "./Course";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  accountType: "lecturer" | "tutor";

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date_joined: string;

  @Column({ default: false })
  blocked: boolean;

  @ManyToMany(() => Course, course => course.lecturers)
  @JoinTable() 
  courses: Course[];
}
