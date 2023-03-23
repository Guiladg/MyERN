export interface User {
	id: number;
	name: string;
	last_name: string;
	username: string;
	password?: string;
	role: string;
	email: string;
}

export type UserValidation = Partial<User>;

const userRoles = {
	ADMIN: 'Administrator',
	USER: 'Regular user'
};

export const getUserRole = (role: string) => {
	return userRoles[role];
};

export const userRolesList = () => {
	return Object.keys(userRoles).map((key) => {
		return {
			key: key,
			value: userRoles[key]
		};
	});
};
