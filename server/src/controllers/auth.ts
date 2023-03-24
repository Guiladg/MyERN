import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user';
import { randomBytes } from 'crypto';
import ResetToken from '../models/resetToken';
import { sendEmail } from '../utils/sendEmail';
import { createTokens } from '../utils/jwt';

class AuthController {
	static login = async (req: Request, res: Response) => {
		// Login data from body
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).send();
		}

		// Find user by username or email
		let user: User;
		try {
			user = await User.findOneOrFail({
				where: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
			});
		} catch (error) {
			return res.status(400).send();
		}

		// Check password
		if (!user.checkIfUnencryptedPasswordIsValid(password)) {
			return res.status(401).send();
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		try {
			[newAccessToken, newRefreshToken] = createTokens(user);
		} catch (error) {
			return res.status(500).send();
		}

		// Send tokens to the client inside cookies
		res.cookie('access_token', newAccessToken, {
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});

		// Return user without unnecessary data
		const { password: pass, refreshToken, ...retData } = user;
		res.send(retData);
	};

	static refresh = async (req: Request, res: Response) => {
		// Refresh token from cookies
		const refreshToken = req.cookies.refresh_token;

		// If there is no token the request is unauthorized
		if (!refreshToken) {
			return res.status(403).send();
		}

		// Validate refresh token
		let payload: { username: string };
		try {
			payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as { username: string };
		} catch (error) {
			return res.status(401).send();
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { username: payload.username } });
		} catch (error) {
			return res.status(400).send();
		}

		// Verify that the refresh token is the last one created
		if (refreshToken !== user.refreshToken) {
			return res.status(401).send();
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		try {
			[newAccessToken, newRefreshToken] = createTokens(user);
		} catch (error) {
			return res.status(500).send();
		}

		// Send tokens to the client inside cookies
		res.cookie('access_token', newAccessToken, {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: process.env.NODE_ENV === 'production',
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: process.env.NODE_ENV === 'production',
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});
		res.send();
	};

	static validate = (req: Request, res: Response) => {
		// Return 204 when middleware validated authentication token
		res.status(204).send();
	};

	static logout = async (req: Request, res: Response) => {
		// Refresh token from cookies
		const refreshToken = req.cookies.refresh_token;

		// If there is a refresh token, try to remove it from user data
		if (refreshToken) {
			// Get user
			const user = await User.findOne({ where: { refreshToken } });
			if (user) {
				// Empty refresh token in user data
				user.refreshToken = null;
				try {
					user.save();
				} catch (error) {
					// Just avoid nodejs stopping
				}
			}
		}

		// Delete cookies from client
		res.cookie('access_token', '', { maxAge: 1 });
		res.cookie('refresh_token', '', { maxAge: 1 });
		res.send();
	};

	static changePassword = async (req: Request, res: Response) => {
		// Get the username from middlewares
		const username = res.locals.jwtPayload.username;

		// Data for password change
		const { oldPassword, newPassword } = req.body;
		if (!oldPassword || !newPassword) {
			return res.status(400).send();
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { username } });
		} catch (error) {
			return res.status(404).send();
		}

		// Verify current password
		if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
			return res.status(404).send();
		}

		// Change password and encrypt it
		user.password = newPassword;
		user.hashPassword();

		// Save new user data
		try {
			await user.save();
		} catch (error) {
			return res.status(500).send();
		}

		// Return 204
		res.status(204).send();
	};

	static resetPassword = async (req: Request, res: Response) => {
		// User email from body
		const email = req.body.email;
		if (!email) {
			return res.status(400).send();
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { email } });
		} catch (error) {
			return res.status(404).send();
		}

		// Search for a recovery token or create it
		let resetToken: ResetToken;
		try {
			resetToken = await ResetToken.findOneOrFail({ where: { idUser: user.id } });
		} catch (error) {
			resetToken = new ResetToken();
			resetToken.idUser = user.id;
			resetToken.token = randomBytes(8).toString('hex');
			try {
				await resetToken.save();
			} catch (error) {
				return res.status(500).send();
			}
		}

		// Generate recovery link
		const link = `${process.env.ADMIN_URL}/resetpass/${user.username}/${resetToken.token}`;

		// Send mail to user
		try {
			await sendEmail(email, 'Restore password', `Restore password link: <a href="${link}">${link}</a>`);
		} catch (error) {
			return res.status(400).send();
		}

		// Return restoration link
		res.send(link);
	};

	static restorePassword = async (req: Request, res: Response) => {
		// Username, restore token and new password from body
		const { username, token, password } = req.body;
		if (!username || !token || !password) {
			return res.status(400).send();
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { username } });
		} catch (error) {
			return res.status(401).send();
		}

		// Get restore token
		let resetToken: ResetToken;
		try {
			resetToken = await ResetToken.findOneOrFail({ where: { idUser: user.id, token: token } });
		} catch (error) {
			return res.status(401).send();
		}

		// Change password and encrypt
		user.password = password;
		user.hashPassword();

		// Save new user data
		try {
			await user.save();
		} catch (error) {
			return res.status(500).send();
		}

		// Remove token from database
		await resetToken.remove();

		// Return 204
		res.status(204).send();
	};
}
export default AuthController;
