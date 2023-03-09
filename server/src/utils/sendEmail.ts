import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import striptags from 'striptags';

/**
 * Envía un mail
 * @param to Destinatario
 * @param subject Asunto
 * @param body Cuerpo HTML
 * @param attachments array de adjuntos { filename, content }
 * @returns
 */
export const sendEmail = async (to: string, subject: string, body: string, attachments: Mail.Attachment[] = []) => {
	// Crea el transporter para conectarse al SMTP
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: false,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD
		},
		tls: {
			ciphers: 'SSLv3',
			rejectUnauthorized: false
		}
	});

	// HTML
	const head =
		'<div style="border-bottom: 2px solid #006989; padding-bottom: 5px; margin-bottom: 25px; width: 100%;"><td><img src="cid:logoHeader" alt=""></div>';
	const foot = '<div style="border-top: 2px solid #439fb4; padding-top: 10px; margin-top: 25px; color: #888"></div>';

	// Envía el mail, en base a que funcione o no, resuelve o rechaza la promesa
	return transporter.sendMail({
		from: process.env.SMTP_FROM,
		to,
		subject,
		html: head + body + foot,
		text: striptags(body),
		attachments: [
			...attachments,
			{
				filename: 'logo.png',
				path: __dirname + '/../assets/logo.png',
				cid: 'logoHeader'
			}
		]
	});
};
