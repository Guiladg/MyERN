import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, AfterLoad, VirtualColumn } from 'typeorm';
import { Length, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Entity('user')
@Unique(['username', 'email'])
export default class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsNotEmpty()
	name: string;

	@Column()
	@IsNotEmpty()
	last_name: string;

	@VirtualColumn({ query: (alias) => `CONCAT(${alias}.last_name, ', ', ${alias}.name)` })
	full_name: string;

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

	hashPassword() {
		this.password = bcrypt.hashSync(this.password, 8);
	}

	checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
		return bcrypt.compareSync(unencryptedPassword, this.password);
	}
}
