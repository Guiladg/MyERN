import User from 'src/models/user';
import * as jwt from 'jsonwebtoken';

/**
 * Generate access and refresh tokens and save the second in user data.
 *
 * @param user User object to generate tokens and save in database.
 * @returns Tuple with access and refresh tokens.
 */
export const createTokens = (user: User): [string, string] => {
	const payload = { username: user.username };
	// Create new refresh token
	const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.ACCESS_TOKEN_LIFE)
	});

	// Create new refresh token
	const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
		algorithm: 'HS256',
		expiresIn: Number(process.env.REFRESH_TOKEN_LIFE)
	});

	// Save refresh token in user data
	user.refreshToken = newRefreshToken;
	try {
		user.save();
	} catch (e) {
		throw new Error('Database Error');
	}

	return [newAccessToken, newRefreshToken];
};
