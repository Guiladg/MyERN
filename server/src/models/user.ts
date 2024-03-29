import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, VirtualColumn } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { safeVirtualColumnQuery } from '../utils/typeORM';

export const userRoles = ['admin'] as const;
export type UserRole = (typeof userRoles)[number];

@Entity('user')
@Unique(['username', 'email'])
export default class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	@IsNotEmpty()
	firstName: string;

	@Column({ nullable: true })
	@IsNotEmpty()
	lastName: string;

	@VirtualColumn({ query: (alias) => safeVirtualColumnQuery(alias, `CONCAT(${alias}."lastName", ', ', ${alias}."firstName")`) })
	fullName: string;

	@Column()
	@Length(4, 20)
	username: string;

	@Column()
	@Length(4, 100)
	password: string;

	@Column()
	@IsNotEmpty()
	role: UserRole;

	@Column()
	@Length(3, 320)
	email: string;

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 8);
	}

	checkPassword(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password);
	}
}
