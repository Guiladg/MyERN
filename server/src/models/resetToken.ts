import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export default class ResetToken extends BaseEntity {
	@PrimaryGeneratedColumn()
	idResetToken: number;

	@Column()
	@IsNotEmpty()
	idUser: number;

	@Column()
	@IsNotEmpty()
	token: string;

	@Column()
	@CreateDateColumn()
	createdAt: Date;
}
