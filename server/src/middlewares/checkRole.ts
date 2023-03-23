import { Request, Response, NextFunction } from 'express';

import User from '../models/user';

export const checkRole = (roles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Get the username from previous middleware
		const username = res.locals.jwtPayload.username;

		// Get user role from the database
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { username } });
		} catch (id) {
			return res.status(401).send();
		}

		// Check if array of authorized roles includes the user's role
		if (roles.indexOf(user.role) > -1) {
			next();
		} else {
			res.status(401).send();
		}
	};
};
