import User from '../models/user';
import * as jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken';
import { Payload, RefreshPayload } from '../types/payload';

/**
 * Generate access and refresh tokens and save the second in user data.
 *
 * @param user User object to generate tokens and save in database.
 * @returns Tuple with access, refresh and non-http-only tokens.
 */
export const createTokens = (user: User): [string, string, string] => {
	const payload: Payload = { username: user.username, role: user.role, id: user.id };
	// Create new refresh token
	const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.ACCESS_TOKEN_LIFE)
	});

	// Create new refresh token
	// Create random string to be used as refresh token identifier
	const token = generateRandomString(16);
	const refreshPayload: RefreshPayload = { idUser: user.id, token };
	const newRefreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
	});

	// Create new empty token for non-http-only use (for logout offline purpose)
	const newControlToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
	});

	// Save refresh token in database
	const refreshTokenRecord = new RefreshToken();
	refreshTokenRecord.idUser = user.id;
	refreshTokenRecord.token = token;
	refreshTokenRecord.expires = Math.round(new Date().getTime() / 1000) + Number(process.env.REFRESH_TOKEN_LIFE);
	try {
		refreshTokenRecord.save();
	} catch (e) {
		throw new Error('Database Error');
	}

	return [newAccessToken, newRefreshToken, newControlToken];
};

/**
 * Remove a refresh token from the database
 * @param refreshToken Token to remove from database
 */
export const removeToken = async (refreshToken: string) => {
	try {
		const { idUser, token } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as RefreshPayload;
		const refreshTokenRecord = await RefreshToken.findOne({ where: { idUser, token } });
		if (refreshTokenRecord) {
			refreshTokenRecord.remove();
		}
	} catch (error) {
		// Just avoid nodejs crashing
	}
};

/**
 * Create a random string
 * @param length Size of the string to be returned
 * @returns Created string
 */
const generateRandomString = (length: number) => {
	const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
	const randomArray = Array.from({ length }, (v, k) => chars[Math.floor(Math.random() * chars.length)]);
	const randomString = randomArray.join('');
	return randomString;
};
