import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';

@Entity({ name: 'refreshTokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn('identity')
    id!: number;

    @Column({ type: 'timestamp' })
    expireAt: Date;

    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn()
    createdAt!: number;

    @UpdateDateColumn()
    updatedAt!: number;
}
