import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";
import { LecturerSelection } from "./LecturerSelection"; 

@Entity()
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.applications)
    user: User;

    @ManyToOne(() => Course, (course) => course.applications)
    course: Course;

    @Column()
    role: string;

    @Column()
    previousRole: string;

    @Column()
    availability: string;

    @Column()
    skills: string;

    @Column()
    academicCredentials: string;

    @Column({ default: "Pending" })
    status: string;

    @OneToMany(() => LecturerSelection, (ls) => ls.application)
    lecturerSelections: LecturerSelection[];
}
