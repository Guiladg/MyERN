import { Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useCallback, useState } from 'react';
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
	const { user } = useAuth();

	const modalDialog = useModalDialog();

	const rest = useRest();

	// States
	const [loading, setLoading] = useState(false);

	const initialValues = {
		name: user?.name ?? '',
		last_name: user?.last_name ?? '',
		username: user?.username ?? '',
		email: user?.email ?? ''
	};
	const [values, setValues] = useState(initialValues);

	const initialValidation = {
		name: '',
		last_name: '',
		username: '',
		email: ''
	};
	const [validation, setValidation] = useState(initialValidation);

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
		setValues(initialValues);
		setValidation(initialValidation);
		onClose();
	};

	/**
	 * Submit changes
	 */
	const handleSubmit = () => {
		// Validate field
		const temp = initialValidation;
		temp.name = values.name.length ? temp.name : 'This is a required field';
		temp.last_name = values.last_name.length ? temp.last_name : 'This is a required field';
		temp.username = values.username.length ? temp.username : 'This is a required field';
		temp.email =
			/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
				values.email
			)
				? temp.email
				: 'This email address is incorrect';
		temp.email = values.email.length ? temp.email : 'This is a required field';
		setValidation({ ...temp });
		if (!Object.values(temp).every((x) => x === '')) {
			return;
		}

		// Change data through API
		setLoading(true);
		rest({ method: 'patch', url: 'usuario/profile', data: values })
			.then((response) => {
				modalDialog({ type: 'success', title: 'User profile', text: response.data }).then(() => onClose());
			})
			.catch((error) => {
				modalDialog({ type: 'error', title: 'User profile', text: error.data });
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
				<DialogTitle>User profile</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 2 }}>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.name)}
							id="name"
							label="First name"
							helperText={validation.name}
							onChange={handleChange('name')}
							value={values.name}
							required
						/>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.last_name)}
							id="last_name"
							label="Last name"
							helperText={validation.last_name}
							onChange={handleChange('last_name')}
							value={values.last_name}
							required
						/>
						<TextField
							sx={{ width: '100%' }}
							error={Boolean(validation.username)}
							id="username"
							label="Username"
							helperText={validation.username}
							onChange={handleChange('username')}
							value={values.username}
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
						Ok
					</ProgressButton>
					<Button color="error" onClick={handleClose} autoFocus>
						Cancel
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default ProfileModal;
