import { Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ProgressButton from 'src/components/ProgressButton';
import useAuth from 'src/contexts/Auth';
import useRest from 'src/hooks/useRest';
import { useModalDialog } from 'src/contexts/ModalDialog';

interface PasswordModalProps {
	open: boolean;
	onClose?: () => void;
}

function ProfileModal(props: PasswordModalProps) {
	// Parameters
	const open = props.open;
	const onClose = useCallback(props.onClose, [props.onClose]);

	// Hooks
	const auth = useAuth();

	const modalDialog = useModalDialog();

	const rest = useRest();

	// States
	const [loading, setLoading] = useState(false);

	const [values, setValues] = useState({
		name: '',
		last_name: '',
		username: '',
		email: ''
	});

	const initialValidation = {
		name: '',
		last_name: '',
		username: '',
		email: ''
	};
	const [validation, setValidation] = useState(initialValidation);

	useEffect(() => {
		setValues({
			name: auth?.user?.name ?? '',
			last_name: auth?.user?.last_name ?? '',
			username: auth?.user?.username ?? '',
			email: auth?.user?.email ?? ''
		});
	}, [auth?.user?.id]);

	/**
	 * Change values state for the selected field
	 * @param field Field to change
	 */
	const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
		// Email y username en minusculas
		if (field === 'email' || field === 'username') {
			event.target.value = event.target.value.toLowerCase();
		}
		setValues({ ...values, [field]: event.target.value });
		setValidation({ ...validation, [field]: '' });
	};

	/**
	 * Close profile modal
	 */
	const handleClose = () => {
		setValidation(initialValidation);
		onClose();
	};

	/**
	 * Submit changes
	 */
	const handleSubmit = () => {
		// Validate field
		const temp = initialValidation;
		temp.name = values.name.length ? temp.name : 'Este campo es obligatorio';
		temp.last_name = values.last_name.length ? temp.last_name : 'Este campo es obligatorio';
		temp.username = values.username.length ? temp.username : 'Este campo es obligatorio';
		temp.email =
			/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
				values.email
			)
				? temp.email
				: 'Direccion de email es incorrecta';
		temp.email = values.email.length ? temp.email : 'Este campo es obligatorio';
		setValidation({ ...temp });
		if (!Object.values(temp).every((x) => x === '')) {
			return;
		}

		// Change data through API
		setLoading(true);
		rest({ method: 'patch', url: 'user/profile', data: values })
			.then(({ data }) => {
				modalDialog({ type: 'success', title: 'Datos personales', text: data.text }).then(() => onClose());
			})
			.catch(({ data }) => {
				modalDialog({ type: 'error', title: 'Datos personales', text: data });
			})
			.finally(() => setLoading(false));
	};

	return (
		<Dialog open={open}>
			<form
				noValidate
				onSubmit={(event: React.FormEvent) => {
					event.preventDefault();
					handleSubmit();
				}}
				autoComplete="on"
			>
				<DialogTitle>Datos personales</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 2 }}>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.username)}
							id="username"
							label="Nombre de usuario"
							helperText={validation.username}
							onChange={handleChange('username')}
							value={values.username}
							disabled
						/>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.name)}
							id="name"
							label="Nombre"
							helperText={validation.name}
							onChange={handleChange('name')}
							value={values.name}
							required
						/>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.last_name)}
							id="last_name"
							label="Apellido"
							helperText={validation.last_name}
							onChange={handleChange('last_name')}
							value={values.last_name}
							required
						/>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.email)}
							id="email"
							label="Email"
							helperText={validation.email}
							onChange={handleChange('email')}
							value={values.email}
							required
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<ProgressButton type="submit" loading={loading}>
						Aceptar
					</ProgressButton>
					<Button color="error" onClick={handleClose} autoFocus>
						Cancelar
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default ProfileModal;
