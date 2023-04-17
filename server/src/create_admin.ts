import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import User from './models/user';

// Load .env file
dotenv.config();

// Establish database connection
const dataSource = new DataSource({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	type: 'mysql',
	synchronize: true,
	logging: ['error'],
	logger: 'simple-console',
	entities: [User]
});

dataSource
	.initialize()
	.then(async () => {
		// Creates a new admin user
		const user_admin = new User();
		user_admin.name = 'admin';
		user_admin.last_name = 'admin';
		user_admin.username = 'admin';
		user_admin.password = 'admin';
		user_admin.email = process.env.ADMIN_EMAIL;
		user_admin.hashPassword();
		user_admin.role = 'ADMIN';
		await user_admin.save();

		console.log('Admin user created');
		process.exit();
	})
	.catch((error) => console.error(error));
