import * as dotenv from 'dotenv';
import { DataSource, LogLevel } from 'typeorm';
import express from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/';
import { sendEmail } from './utils/sendEmail';

// Load .env file
dotenv.config();

// Establish database connection
export const dataSource = new DataSource({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	type: 'mysql',
	synchronize: true,
	logging: ['error', ...((process.env.NODE_ENV !== 'production' ? ['query'] : []) as LogLevel[])],
	logger: 'simple-console',
	entities: [__dirname + '/**/models/*.{ts,js}']
});

dataSource
	.initialize()
	.then(async () => {
		// Start express
		const app = express();

		// Middlewares
		app.use(cors({ origin: true, credentials: true }));
		app.use(helmet());
		app.use(bodyParser.json());
		app.use(cookieParser());

		// API routes
		app.use(`/${process.env.API_ROUTE}/`, routes);

		// Start listening requests
		app.listen(process.env.PORT, () => {
			console.log(`\nServer started on port ${process.env.PORT}.`);
			console.log(`App root folder: ${__dirname}. \n`);
		});
	})
	.catch((error) => {
		console.error('Error initializing database:', error);
		// DB error, send mail to administrator and exit
		sendEmail(process.env.ADMIN_EMAIL, 'Error in DB', `Error initializing database ${process.env.DB_NAME}.`).finally(() => process.exit());
	});
