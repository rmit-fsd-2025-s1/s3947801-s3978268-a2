import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 254, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "enum", enum: ["lecturer", "tutor"] })
  accountType: "lecturer" | "tutor";

  @CreateDateColumn({ type: "timestamp" })
  date_joined: Date; // This is automatically set by the database
}
