import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user';
import { randomBytes } from 'crypto';
import ResetToken from '../models/resetToken';
import { sendEmail } from '../utils/sendEmail';
import { createTokens, removeToken } from '../utils/jwt';
import RefreshToken from '../models/refreshToken';
import { MoreThan } from 'typeorm';
import { RefreshPayload } from '../types/payload';

class AuthController {
	static login = async (req: Request, res: Response) => {
		// Login data from body
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).send('Nombre de usuario y contraseña son obligatorios');
		}

		// Find user by username or email
		let user: User;
		try {
			user = await User.findOneOrFail({
				where: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
			});
		} catch (error) {
			return res.status(401).send('Nombre de usuario o contraseña incorrectos');
		}

		// Check password
		if (!user.checkPassword(password)) {
			return res.status(401).send('Nombre de usuario o contraseña incorrectos');
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			return res.status(500).send('Error en la base de datos');
		}

		// Send tokens to the client inside cookies
		res.cookie('access_token', newAccessToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('control_token', newControlToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: false,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});

		// Return user without unnecessary data
		const { password: pass, ...retData } = user;
		res.send(retData);
	};

	static refresh = async (req: Request, res: Response) => {
		// Control (non-http-only) token from cookies
		const controlToken = req.cookies.control_token;

		// Refresh token from cookies
		const refreshToken = req.cookies.refresh_token;

		// If there is no control token finish logout and return error status
		if (!controlToken) {
			// Remove refresh token from database
			removeToken(refreshToken);

			// Delete cookies from client
			res.cookie('access_token', '', { maxAge: 1 });
			res.cookie('refresh_token', '', { maxAge: 1 });
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Falta token de control' : '');
		}

		// If there is no token the request is unauthorized
		if (!refreshToken) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Falta token de refresh' : '');
		}

		// Validate refresh token
		let refreshPayload: RefreshPayload;
		try {
			refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as RefreshPayload;
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Token de refresh inválido' : '');
		}

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { id: refreshPayload.idUser } });
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Usuario no encontrado' : '');
		}

		// Verify that the refresh token is in database and remove it
		// Double check validity
		let refreshTokenRecord: RefreshToken;
		try {
			const expirationTime = Math.round(new Date().getTime() / 1000);
			refreshTokenRecord = await RefreshToken.findOneOrFail({
				where: { idUser: refreshPayload.idUser, token: refreshPayload.token, expires: MoreThan(expirationTime) }
			});
			refreshTokenRecord.remove();
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Token de refresh no encontrado' : '');
		}

		// Create tokens and store refresh in database
		let newAccessToken: string;
		let newRefreshToken: string;
		let newControlToken: string;
		try {
			[newAccessToken, newRefreshToken, newControlToken] = createTokens(user);
		} catch (error) {
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Error al crear tokens' : '');
		}

		// Send tokens to the client inside cookies
		res.cookie('access_token', newAccessToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.ACCESS_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('refresh_token', newRefreshToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: true,
			maxAge: Number(process.env.REFRESH_TOKEN_LIFE) * 60 * 1000
		});
		res.cookie('control_token', newControlToken, {
			sameSite: 'none',
			secure: true,
			httpOnly: false,
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

		// Remove refresh token from database
		removeToken(refreshToken);

		// Delete cookies from client
		res.cookie('access_token', '', { maxAge: 1 });
		res.cookie('refresh_token', '', { maxAge: 1 });
		res.cookie('control_token', '', { maxAge: 1 });
		res.send();
	};

	static changePassword = async (req: Request, res: Response) => {
		// Get the username from middlewares
		const username = req?.jwtPayload?.username ?? '';

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
		if (!user.checkPassword(oldPassword)) {
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
			return res.status(401).send(process.env.NODE_ENV !== 'production' ? 'Token de restauración inválido' : '');
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

	static userData = async (req: Request, res: Response) => {
		// idUser from payload
		const idUser = req?.jwtPayload?.id;

		// Get user
		let user: User;
		try {
			user = await User.findOneOrFail({ where: { id: idUser } });
		} catch (error) {
			return res.status(404).send(process.env.NODE_ENV !== 'production' ? 'Usuario inexistente' : '');
		}

		// Return user without unnecessary data
		const { password: pass, ...retData } = user;
		res.send(retData);
	};
}
export default AuthController;
