export const userRolesLabel = {
	ADMIN: 'Administrador'
} as const;
export const userRoles = ['ADMIN'] as const;
export type UserRole = (typeof userRoles)[number];

export interface User {
	id: number;
	name: string;
	last_name: string;
	username: string;
	password?: string;
	role: UserRole;
	email: string;
}

export const getUserRole = (role: string) => {
	return userRolesLabel[role];
};
