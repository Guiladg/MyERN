import { Request, Response } from 'express';
import { validate } from 'class-validator';
import User from '../models/user';
import { Not } from 'typeorm';

class UserController {
	static list = async (req: Request, res: Response) => {
		// Busca los usuarios
		const data = await User.find({
			select: ['idUser', 'name', 'last_name', 'username', 'role', 'email']
		});

		// Devuelve los usuario
		res.send(data);
	};

	static get = async (req: Request, res: Response) => {
		// Parametro ID desde URL
		const id = Number(req.params.id);

		// Busca al usuario y si no existe, devuelve 404
		let data: User;
		try {
			data = await User.findOneOrFail({
				where: { idUser: id },
				select: ['idUser', 'name', 'last_name', 'username', 'role', 'email']
			});
		} catch (error) {
			res.status(404).send('Usuario no encontrado');
		}

		// Devuelve el usuario
		res.send(data);
	};

	static add = async (req: Request, res: Response) => {
		// Data del usuario a crear desde el body
		const { name, last_name, username, password, role, email } = req.body;

		// Crea el usuario temporal
		const record = new User();
		record.name = name;
		record.last_name = last_name;
		record.username = username?.toLowerCase();
		record.password = password;
		record.role = role;
		record.email = email?.toLowerCase();

		// Valida la data, si encuentra error devuelve 400
		const errors = await validate(record);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Busca duplicados en email y username
		let test: User;
		test = await User.findOne({ where: { username: username?.toLowerCase() } });
		if (test) {
			return res.status(400).send('Nombre de usuario ocupado.');
		}
		test = await User.findOne({ where: { email: email?.toLowerCase() } });
		if (test) {
			return res.status(400).send('Email ocupado.');
		}

		// Encripta el password
		record.hashPassword();

		// Intenta guardar
		try {
			await record.save();
		} catch (e) {
			res.status(409).send('Error inesperado.');
			return;
		}

		// Envia 201 cuando todo sale bien
		res.status(200).send({
			record: record,
			text: 'Usuario creado correctamente.'
		});
	};

	static edit = async (req: Request, res: Response) => {
		// Parametro ID desde URL
		const id = Number(req.params.id);

		// Data del usuario a modificar desde el body
		const { name, last_name, username, password, role, email } = req.body;

		// Busca al usuario y si no existe, devuelve 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { idUser: id } });
		} catch (error) {
			return res.status(404).send('Usuario no encontrado.');
		}

		// Modifica el usuario temporal
		record.name = name;
		record.last_name = last_name;
		record.username = username?.toLowerCase();
		if (password !== undefined) {
			record.password = password;
		}
		record.role = role;
		record.email = email?.toLowerCase();

		// Valida la data, si encuentra error devuelve 400
		const errors = await validate(record);
		console.log(errors);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Busca duplicados en email y username
		let test: User;
		test = await User.findOne({
			where: { username: username?.toLowerCase(), idUser: Not(id) }
		});
		if (test) {
			return res.status(400).send('El nombre de usuario está ocupado por otro usuario.');
		}
		test = await User.findOne({
			where: { email: email?.toLowerCase(), idUser: Not(id) }
		});
		if (test) {
			return res.status(400).send('La dirección de email está ocupada por otro usuario.');
		}

		// Encripta el password
		record.hashPassword();

		// Intenta guardar o devuelve error
		try {
			await record.save();
		} catch (e) {
			return res.status(409).send('Error inesperado.');
		}

		// Envia 200 (o 204) cuando todo sale bien
		res.status(200).send({
			record: record,
			text: 'Usuario modificado con éxito.'
		});
	};

	static editProfile = async (req: Request, res: Response) => {
		// Toma el ID del usuario desde JWT
		const id = res.locals.jwtPayload.userId;

		// Data del usuario a modificar desde el body
		const { name, last_name, username, email } = req.body;

		// Busca al usuario y si no existe, devuelve 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { idUser: Number(id) } });
		} catch (error) {
			return res.status(404).send('Usuario no encontrado.');
		}

		// Modifica el usuario temporal
		record.name = name;
		record.last_name = last_name;
		record.username = username?.toLowerCase();
		record.email = email?.toLowerCase();

		// Valida la data, si encuentra error devuelve 400
		const errors = await validate(record);
		console.log(errors);
		if (errors.length > 0) {
			return res.status(400).send(errors);
		}

		// Busca duplicados en email y username
		let test: User;
		test = await User.findOne({
			where: { username: username?.toLowerCase(), idUser: Not(id) }
		});
		if (test) {
			return res.status(400).send('El nombre de usuario está ocupado por otro usuario.');
		}
		test = await User.findOne({
			where: { email: email?.toLowerCase(), idUser: Not(id) }
		});
		if (test) {
			return res.status(400).send('La dirección de email está ocupada por otro usuario.');
		}

		// Intenta guardar o devuelve error
		try {
			await record.save();
		} catch (e) {
			return res.status(409).send('Error inesperado.');
		}

		// Envia 200 (o 204) cuando todo sale bien
		res.status(200).send('Perfil de usuario modificado con éxito.');
	};

	static delete = async (req: Request, res: Response) => {
		// Parametro ID desde URL
		const id = req.params.id;

		// Impide eliminar al usuario loggeado
		if (id == res.locals.jwtPayload.userId) {
			return res.status(409).send('No puede eliminarse al usuario actual.');
		}

		// Busca al usuario y si no existe, devuelve 404
		let record: User;
		try {
			record = await User.findOneOrFail({ where: { idUser: Number(id) } });
		} catch (error) {
			return res.status(404).send('Usuario no encontrado.');
		}

		// Intenta eliminar o devuelve error
		try {
			await record.remove();
		} catch (e) {
			return res.status(409).send('Error inesperado.');
		}

		// Envia 200 (o 204) cuando todo sale bien
		res.status(200).send('Usuario eliminado con éxito.');
	};

	static batchDelete = async (req: Request, res: Response) => {
		// Parametro IDs desde URL
		const ids = req.body.ids;

		const text: string[] = [];
		const oks: number[] = [];

		for (const id of ids) {
			// Impide eliminar al usuario loggeado
			if (id == res.locals.jwtPayload.userId) {
				text.push(` - ID: ${id}. No puede eliminarse al usuario actual.`);
				continue;
			}

			// Busca al usuario y si no existe, devuelve 404
			let record: User;
			try {
				record = await User.findOneOrFail({ where: { idUser: Number(id) } });
			} catch (error) {
				text.push(` - ID: ${id}. Usuario no encontrado.`);
				continue;
			}

			// Intenta eliminar o devuelve error
			try {
				await record.remove();
			} catch (e) {
				text.push(` - ID: ${id}. Error inesperado.`);
				continue;
			}

			// Agrega el id eliminado al registro
			oks.push(id);
		}

		// Si hay texto emitido (hubieron errores), que agregue un titulo al principio
		if (text.length > 0) {
			text.unshift('\nSe produjeron los siguientes errores:');
		}

		// Si no hay oks, todos dieron error
		if (!oks.length) {
			text.unshift('No se pudo eliminar ningún registro.');
			return res.status(409).send(text.join('\n'));
		}

		// Envia 200 (o 204) cuando todo sale bien
		text.unshift(`${oks.length} usuarios eliminado con éxito.`);
		res.status(200).send({
			ids: oks,
			text: text.join('\n')
		});
	};
}

export default UserController;
