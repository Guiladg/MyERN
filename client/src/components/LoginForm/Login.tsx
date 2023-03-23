import { CardContent, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Link, FormHelperText } from '@mui/material';
import Visibility from '@mui/icons-material/VisibilityTwoTone';
import VisibilityOff from '@mui/icons-material/VisibilityOffTwoTone';
import useAuth from 'src/contexts/Auth';
import { useState } from 'react';
import { useModalDialog } from 'src/contexts/ModalDialog';
import ProgressButton from '../ProgressButton';

function Login(props: { visible: boolean; onShowRestore: () => void }) {
	// Props
	const { visible, onShowRestore } = props;

	// Hooks
	const modalDialog = useModalDialog();
	const { logIn, loading } = useAuth();

	// States
	const [values, setValues] = useState<{ username: string; password: string }>({
		username: '',
		password: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [validation, setValidation] = useState({
		username: '',
		password: ''
	});

	const handleClickLogin = () => {
		const temp = validation;
		temp.username = values.username.length ? '' : 'This is a required field';
		temp.password = values.password.length ? '' : 'This is a required field';
		setValidation({ ...temp });
		if (Object.values(temp).every((x) => x === '')) {
			logIn(values).catch((response) => modalDialog({ type: 'error', title: 'Log in error', text: response }));
		}
	};

	const handleChange = (prop: keyof { username: string; password: string }) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [prop]: event.target.value });
		setValidation({ ...validation, [prop]: '' });
	};

	const handleClickShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<CardContent
			sx={{
				display: visible ? 'flex' : 'none',
				flexDirection: 'column'
			}}
			component="form"
			noValidate
			onSubmit={(event: React.FormEvent) => {
				event.preventDefault();
				handleClickLogin();
			}}
			autoComplete="on"
		>
			<FormControl error={Boolean(validation.username)} variant="outlined" sx={{ mb: 1 }}>
				<InputLabel htmlFor="username">Username</InputLabel>
				<OutlinedInput autoFocus label="Username" id="username" value={values.username} onChange={handleChange('username')} disabled={loading} />
				<FormHelperText>{validation.username}</FormHelperText>
			</FormControl>
			<FormControl error={Boolean(validation.password)} variant="outlined" sx={{ mb: 1 }}>
				<InputLabel htmlFor="password">Password</InputLabel>
				<OutlinedInput
					label="Password"
					id="password"
					type={showPassword ? 'text' : 'password'}
					value={values.password}
					onChange={handleChange('password')}
					disabled={loading}
					endAdornment={
						<InputAdornment position="end">
							<IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					}
				/>
				<FormHelperText>{validation.password}</FormHelperText>
			</FormControl>
			<Link component="button" type="button" onClick={() => onShowRestore()} disabled={loading}>
				Lost your password?
			</Link>
			<ProgressButton variant="contained" sx={{ mt: 2, width: '100%' }} type="submit" loading={loading}>
				Log in
			</ProgressButton>
		</CardContent>
	);
}
export default Login;
