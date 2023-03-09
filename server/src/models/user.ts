import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Entity('user')
@Unique(['username', 'email'])
export default class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	idUser: number;

	@Column()
	@IsNotEmpty()
	name: string;

	@Column()
	@IsNotEmpty()
	last_name: string;

	@Column()
	@Length(4, 20)
	username: string;

	@Column()
	@Length(4, 100)
	password: string;

	@Column()
	@IsNotEmpty()
	role: string;

	@Column({ default: null })
	@Length(3, 320)
	email: string;

	@Column({ default: null })
	refreshToken: string;

	@Column()
	@CreateDateColumn()
	createdAt: Date;

	@Column()
	@UpdateDateColumn()
	updatedAt: Date;

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 8);
	}

	checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password);
	}
}
