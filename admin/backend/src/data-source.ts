import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { Application } from "./entity/Application";
import { LecturerSelection } from "./entity/LecturerSelection";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237", 
  port: 3306,
  username: "S3947801",
  password: "S3947801",
  database: "S3947801",
  synchronize: true,
  logging: true,
  entities: [User, Course, Application, LecturerSelection],
});
