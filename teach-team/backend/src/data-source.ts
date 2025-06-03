import "reflect-metadata";
import { DataSource } from "typeorm";
import { Application } from "./entity/Application";
import { User } from "./entity/User";
import { LecturerSelection } from "./entity/LecturerSelection";
import { Course } from "./entity/Course";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  /* Change to your own credentials */
  username: "S3947801",
  password: "S3947801",
  database: "S3947801",
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [User, Application, LecturerSelection, Course],
  migrations: [],
  subscribers: [],
});
