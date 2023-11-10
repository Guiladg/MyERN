import * as dotenv from 'dotenv';
import User from './models/user';
import dataSource from './dataSource';

// Load .env file
dotenv.config();

dataSource
	.initialize()
	.then(async () => {
		// Check if there are users created
		if (await User.findOneBy({ username: 'admin' })) {
			console.info('No need to create admin user');
			process.exit();
		}
		// Creates a new admin user
		const user_admin = new User();
		user_admin.firstName = 'admin';
		user_admin.lastName = 'admin';
		user_admin.username = 'admin';
		user_admin.password = 'admin';
		user_admin.email = 'admin@admin.com';
		user_admin.hashPassword();
		user_admin.role = 'admin';
		await user_admin.save();

		console.info('Admin user created');
		process.exit();
	})
	.catch((error) => console.error(error));
