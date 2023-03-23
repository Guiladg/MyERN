import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
	// Access token from cookies
	const accessToken = req.cookies.access_token;

	// If there is no token the request is unauthorized
	if (!accessToken) {
		return res.status(403).send();
	}

	// Validate access token
	let payload: string | jwt.JwtPayload;
	try {
		payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET) as { username: string };
	} catch (error) {
		return res.status(401).send();
	}

	// Saves payload for next middlewares
	res.locals.jwtPayload = payload;

	// Next middleware
	next();
};
