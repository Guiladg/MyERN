import { UserRole } from '../models/user';

export interface Payload {
	id: number;
	username: string;
	role: UserRole;
}

export interface RefreshPayload {
	idUser: number;
	token: string;
}

declare module 'express-serve-static-core' {
	interface Request {
		jwtPayload?: Payload;
	}
}
