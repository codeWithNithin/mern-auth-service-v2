import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('identity')
    id!: number;

    @Column({ type: 'varchar' })
    firstName!: string;

    @Column({ type: 'varchar' })
    lastName!: string;

    @Column({ unique: true, type: 'varchar' })
    email!: string;

    @Column({ select: false, type: 'varchar' })
    password!: string;

    @Column({ type: 'varchar' })
    role: string;

    @CreateDateColumn()
    createdAt!: number;

    @UpdateDateColumn()
    updatedAt!: number;
}
