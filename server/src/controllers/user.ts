import { Request, Response } from 'express';
import { validate } from 'class-validator';
import User from '../models/user';
import { Not } from 'typeorm';

class UserController {
	static list = async (req: Request, res: Response) => {
		// Page number and page size from querystring
		const page = Number(req.query.page) || 0;
		const size = Number(req.query.size) || Number(process.env.PAGE_SIZE);
		const order = req.query.order ?? 'asc';
		const sort = (req.query.sort as string) ?? 'full_name';

		// Select users
		let rows: any[];
		try {
			rows = await User.find({
				select: ['id', 'full_name', 'username', 'role', 'email'],
				skip: page * size,
				take: size,
				order: { [sort]: order }
			});
		} catch (e) {
			return res.status(409).send('Unexpected error.');
		}

		// Get count of rows
		const rowCount = await User.count();

		// Return rows and associated data for rendering the table
		res.send({
			rows,
			rowCount,
			page,
			size,
			order: `${sort} ${order}`
		});
	};

	static get = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = Number(req.params.id);

		// Search for user, if not found, return 404
		let data: User;
		try {
			data = await User.findOneOrFail({
				where: { id },
				select: ['id', 'name', 'last_name', 'username', 'role', 'email']
			});
		} catch (error) {
			return res.status(404).send('User not found.');
		}

		// Return user data
		res.send(data);
	};

	static add = async (req: Request, res: Response) => {
		// New user data from body
		const { name, last_name, username, password, role, email } = req.body;

		// Create temp user
		const record = new User();
		record.name = name;
		record.last_name = last_name;
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
			return res.status(400).send('Username already taken.');
		}
		test = await User.findOne({ where: { email: email?.toLowerCase() } });
		if (test) {
			return res.status(400).send('Email address already in use.');
		}

		// Hash password before saving
		record.hashPassword();

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Database error.');
		}

		// Return 201 and the newly created record without unnecessary data
		const { password: pass, refreshToken, ...retData } = record;
		res.status(201).send({
			record: retData,
			text: 'User created.'
		});
	};

	static edit = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = Number(req.params.id);

		// User data from body
		const { name, last_name, username, password, role, email } = req.body;

		// Search for user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { id: id } });
		} catch (error) {
			return res.status(404).send('User not found.');
		}

		// Edit temp user
		record.name = name;
		record.last_name = last_name;
		record.username = username;
		if (password !== undefined) {
			record.password = password;
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
			return res.status(400).send('Username already taken.');
		}
		test = await User.findOne({ where: { email: email?.toLowerCase(), id: Not(id) } });
		if (test) {
			return res.status(400).send('Email address already in use.');
		}

		// Hash password before saving
		record.hashPassword();

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Database error.');
		}

		// Return 200 and the modified record without unnecessary data
		const { password: pass, refreshToken, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'User modified.'
		});
	};

	static editProfile = async (req: Request, res: Response) => {
		// Get the username from middlewares
		const username = res.locals.jwtPayload.username;

		// User data from body
		const { name, last_name, email } = req.body;

		// Search for user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { username } });
		} catch (error) {
			return res.status(404).send('User not found.');
		}

		// Edit temp user
		record.name = name;
		record.last_name = last_name;
		record.email = email?.toLowerCase();

		// Validate data, on error, return 400
		const errors = await validate(record);
		console.log(errors);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Check if there is already another user with that email
		const test = await User.findOne({ where: { email: email?.toLowerCase(), username: Not(username) } });
		if (test) {
			return res.status(400).send('Email address already in use.');
		}

		// Try to save the record
		try {
			await record.save();
		} catch (e) {
			return res.status(500).send('Database error.');
		}

		// Return 200 and the modified record without unnecessary data
		const { password: pass, refreshToken, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'User profile modified.'
		});
	};

	static delete = async (req: Request, res: Response) => {
		// Id parameter from URL
		const id = req.params.id;

		// Search for user, if not found, return 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { id: Number(id) } });
		} catch (error) {
			return res.status(404).send('User not found.');
		}

		// Prevent user from deleting itself
		if (record.username === res.locals.jwtPayload.username) {
			return res.status(409).send('Cannot delete current user.');
		}

		// Try to delete the record
		try {
			await record.remove();
		} catch (e) {
			return res.status(500).send('Database error.');
		}

		// Return 200 and the deleted record without unnecessary data
		const { password: pass, refreshToken, ...retData } = record;
		res.status(200).send({
			record: retData,
			text: 'User deleted.'
		});
	};
}

export default UserController;
