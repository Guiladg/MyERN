import Visibility from '@mui/icons-material/VisibilityTwoTone';
import VisibilityOff from '@mui/icons-material/VisibilityOffTwoTone';
import {
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	OutlinedInput,
	InputAdornment,
	IconButton,
	FormHelperText
} from '@mui/material';
import { useCallback, useState } from 'react';
import ProgressButton from 'src/components/ProgressButton';
import useAuth from 'src/contexts/Auth';
import { useModalDialog } from 'src/contexts/ModalDialog';

interface PasswordModalProps {
	open: boolean;
	onClose: () => void;
}

function PasswordModal(props: PasswordModalProps) {
	// Parameters
	const open = props.open;
	const onClose = useCallback(props.onClose, [props.onClose]);

	// Hooks
	const modalDialog = useModalDialog();

	const { changePassword, logOut } = useAuth();

	// States

	const [loading, setLoading] = useState(false);

	const initialValues = {
		oldPassword: '',
		newPassword: '',
		newPassword2: ''
	};
	const [values, setValues] = useState(initialValues);

	const [showPassword, setShowPassword] = useState({
		oldPassword: false,
		newPassword: false
	});

	const initialValidation = {
		oldPassword: '',
		newPassword: '',
		newPassword2: ''
	};
	const [validation, setValidation] = useState(initialValidation);

	/**
	 * Change values state for the selected field
	 * @param field Field to change
	 * @returns
	 */
	const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [field]: event.target.value });
		setValidation({ ...validation, [field]: '' });
	};

	/**
	 * Toggle view password for the selected field
	 * @param field Password field to toggle view
	 * @returns
	 */
	const handleClickShowPassword = (field: string) => () => {
		setShowPassword({ ...showPassword, [field]: !showPassword[field] });
	};

	/**
	 * Close password change modal
	 */
	const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
		setValues(initialValues);
		setValidation(initialValidation);
		onClose();
	};

	const handleSubmit = () => {
		// Valida los campos
		const temp = initialValidation;
		temp.newPassword2 = values.newPassword !== values.newPassword2 ? 'Passwords do not match' : temp.newPassword2;
		temp.newPassword = values.newPassword.length < 4 ? 'Four characters at least' : temp.newPassword;
		temp.newPassword = !values.newPassword.length ? 'This is a required field' : temp.newPassword;
		temp.oldPassword = !values.oldPassword.length ? 'This is a required field' : temp.oldPassword;
		temp.newPassword2 = !values.newPassword2.length ? 'This is a required field' : temp.newPassword2;
		setValidation({ ...temp });
		if (!Object.values(temp).every((x) => x === '')) {
			return;
		}

		// Ejecuta el cambio
		setLoading(true);
		changePassword(values)
			.then((response) => {
				modalDialog({ type: 'success', title: 'Cambio de contraseña', text: response + '<br/>' + 'Se deberá volver a iniciar sesión.' }).then(() =>
					logOut()
				);
			})
			.catch((response) => modalDialog({ type: 'error', title: 'Cambio de contraseña', text: response }))
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
				<DialogTitle>Change password</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 2 }}>
						<FormControl error={Boolean(validation.oldPassword)} variant="outlined">
							<InputLabel htmlFor="oldPassword">Current password</InputLabel>
							<OutlinedInput
								label="Current password"
								id="oldPassword"
								type={showPassword.oldPassword ? 'text' : 'password'}
								value={values.oldPassword}
								onChange={handleChange('oldPassword')}
								disabled={loading}
								endAdornment={
									<InputAdornment position="end">
										<IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword('oldPassword')} edge="end">
											{showPassword.oldPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								}
							/>
							<FormHelperText>{validation.oldPassword}</FormHelperText>
						</FormControl>
						<FormControl error={Boolean(validation.newPassword)} variant="outlined">
							<InputLabel htmlFor="newPassword">New password</InputLabel>
							<OutlinedInput
								label="New password"
								id="newPassword"
								type={showPassword.newPassword ? 'text' : 'password'}
								value={values.newPassword}
								onChange={handleChange('newPassword')}
								disabled={loading}
								endAdornment={
									<InputAdornment position="end">
										<IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword('newPassword')} edge="end">
											{showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								}
							/>
							<FormHelperText>{validation.newPassword}</FormHelperText>
						</FormControl>
						<FormControl error={Boolean(validation.newPassword2)} variant="outlined">
							<InputLabel htmlFor="oldPassword">Repeat new password</InputLabel>
							<OutlinedInput
								label="Repeat new password"
								id="newPassword2"
								type={showPassword.newPassword ? 'text' : 'password'}
								value={values.newPassword2}
								onChange={handleChange('newPassword2')}
								disabled={loading}
							/>
							<FormHelperText>{validation.newPassword2}</FormHelperText>
						</FormControl>
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

export default PasswordModal;
