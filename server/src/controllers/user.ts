import { Request, Response } from 'express';
import { validate } from 'class-validator';
import User from '../models/user';
import { Not } from 'typeorm';
import { ClientList } from '../types/client';

class UserController {
	static list = async (req: Request, res: Response) => {
		// Page number and page size from querystring
		const page = Number(req.query.page) || 0;
		const pageSize = Number(req.query.size) || Number(process.env.PAGE_SIZE);
		const order = req.query.order ?? 'asc';
		const sort = (req.query.sort as string) ?? 'fullName';

		// Select users
		let records: User[];
		try {
			records = await User.find({
				select: ['id', 'fullName', 'username', 'role', 'email'],
				skip: page * pageSize,
				take: pageSize,
				order: { [sort]: order }
			});
		} catch (e) {
			return res.status(409).send('Error inesperado.');
		}

		// Get count of rows
		const totalRecords = await User.count();

		// Return rows and associated data for rendering the table
		const ret: ClientList = {
			records,
			totalRecords,
			page,
			pageSize,
			order: `${sort} ${order}`
		};
		res.send(ret);
	};

	static get = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = Number(req.params.id);

		// Search user, if not found, return 404
		let data: User;
		try {
			data = await User.findOneOrFail({
				where: { id },
				select: ['id', 'firstName', 'lastName', 'username', 'role', 'email']
			});
		} catch (error) {
			return res.status(404).send('Registro no encontrado.');
		}

		// Return user data
		res.send(data);
	};

	static add = async (req: Request, res: Response) => {
		// New user data from body
		const { firstName, lastName, username, password, role, email } = req.body;

		// Create temp user
		const record = new User();
		record.firstName = firstName;
		record.lastName = lastName;
		record.username = username?.toLowerCase();
		record.password = password;
		record.role = role;
		record.email = email?.toLowerCase();

		// Validate data, on error, return 400
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Check if there is already another user with that username or email
		let test: User;
		test = await User.findOne({ where: { username: username?.toLowerCase() } });
		if (test) {
			return res.status(400).send('El nombre de usuario se encuentra ocupado.');
		}
		test = await User.findOne({ where: { email: email?.toLowerCase() } });
		if (test) {
			return res.status(400).send('La dirección de email se encuentra ocupada por otro usuario.');
		}

		// Hash password before saving
		record.hashPassword();

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Error en la base de datos.');
		}

		// Return 201 and the newly created record without unnecessary data
		const { password: pass, ...retData } = record;
		res.status(201).send({
			record: retData,
			text: 'Usuario creado.'
		});
	};

	static edit = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = Number(req.params.id);

		// User data from body
		const { firstName, lastName, username, password, role, email, puntoDeRetiro } = req.body;

		// Search user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { id: id } });
		} catch (error) {
			return res.status(404).send('Registro no encontrado.');
		}

		// Edit temp user
		record.firstName = firstName;
		record.lastName = lastName;
		record.username = username;
		if (password !== undefined) {
			record.password = password;
			record.hashPassword();
		}
		record.role = role;
		record.email = email?.toLowerCase();

		// Validate data, on error, return 400
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Check if there is already another user with that username or email
		let test: User;
		test = await User.findOne({ where: { username: username?.toLowerCase(), id: Not(id) } });
		if (test) {
			return res.status(400).send('El nombre de usuario se encuentra ocupado.');
		}
		test = await User.findOne({ where: { email: email?.toLowerCase(), id: Not(id) } });
		if (test) {
			return res.status(400).send('La dirección de email se encuentra ocupada por otro usuario.');
		}

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Error en la base de datos.');
		}

		// Return 200 and the modified record without unnecessary data
		const { password: pass, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'Usuario modificado.'
		});
	};

	static editProfile = async (req: Request, res: Response) => {
		// Get the username from middlewares
		const username = req?.jwtPayload?.username ?? '';

		// User data from body
		const { firstName, lastName, email } = req.body;

		// Search user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { username } });
		} catch (error) {
			return res.status(404).send('Registro no encontrado.');
		}

		// Edit temp user
		record.firstName = firstName;
		record.lastName = lastName;
		record.email = email?.toLowerCase();

		// Validate data, on error, return 400
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Check if there is already another user with that email
		const test = await User.findOne({ where: { email: email?.toLowerCase(), username: Not(username) } });
		if (test) {
			return res.status(400).send('La dirección de email se encuentra ocupada por otro usuario.');
		}

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Error en la base de datos.');
		}

		// Return 200 and the modified record without unnecessary data
		const { password: pass, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'Perfil de usuario modificado.'
		});
	};

	static delete = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = Number(req.params.id);

		// Prevent user from deleting itself
		if (id === req?.jwtPayload?.id) {
			return res.status(409).send('No puede eliminarse el usuario activo.');
		}

		// Search user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { id: Number(id) } });
		} catch (error) {
			return res.status(404).send('Registro no encontrado.');
		}

		// Try to delete the record
		try {
			await record.remove();
		} catch (e) {
			return res.status(500).send('Error en la base de datos.');
		}

		// Return 200 and the deleted record without unnecessary data
		const { password: pass, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'Usuario eliminado con éxito.'
		});
	};
}

export default UserController;
