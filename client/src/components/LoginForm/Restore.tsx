import { CardContent, FormControl, InputLabel, OutlinedInput, Link, FormHelperText, Typography } from '@mui/material';
import useAuth from 'src/contexts/Auth';
import { useState } from 'react';
import ProgressButton from '../ProgressButton';
import { useModalDialog } from 'src/contexts/ModalDialog';

function Restore(props: { visible: boolean; onShowRestore: () => void }) {
	const modalDialog = useModalDialog();

	const { visible, onShowRestore } = props;

	const { restorePassword, loading } = useAuth();

	const [values, setValues] = useState({
		email: ''
	});

	const [validation, setValidation] = useState({
		email: ''
	});

	const handleClickRestore = () => {
		const temp = validation;
		temp.email = values.email.length ? '' : 'This is a required field';
		setValidation({ ...temp });
		if (Object.values(temp).every((x) => x === '')) {
			restorePassword(values.email)
				.then((response) => modalDialog({ type: 'success', title: 'Password reset', text: response }))
				.catch((response) => modalDialog({ type: 'error', title: 'Password reset error', text: response }));
		}
	};

	const handleChange = (prop) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setValues({ ...values, [prop]: event.target.value });
		setValidation({ ...validation, [prop]: '' });
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
				handleClickRestore();
			}}
			autoComplete="on"
		>
			<Typography component="h2" sx={{ mb: 1 }}>
				Enter your email address and wait for your recovery details to be sent.
			</Typography>

			<FormControl error={Boolean(validation.email)} variant="outlined" sx={{ mb: 1 }}>
				<InputLabel htmlFor="email">Email</InputLabel>
				<OutlinedInput autoFocus label="Email" id="email" value={values.email} onChange={handleChange('email')} disabled={loading} />
				<FormHelperText>{validation.email}</FormHelperText>
			</FormControl>

			<Link component="button" type="button" onClick={() => onShowRestore()} disabled={loading}>
				Cancel and return to login
			</Link>

			<ProgressButton variant="contained" sx={{ mt: 2, width: '100%' }} type="submit" loading={loading}>
				Get new password
			</ProgressButton>
		</CardContent>
	);
}
export default Restore;
