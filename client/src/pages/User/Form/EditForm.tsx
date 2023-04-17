import { useState, useEffect } from 'react';
import { Stack, Button, Card, CardContent, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import useRest from 'src/hooks/useRest';
import { User, userRolesList, UserValidation } from 'src/models/user';
import ProgressButton from 'src/components/ProgressButton';
import { useNavigate } from 'react-router-dom';
import { useModalDialog } from 'src/contexts/ModalDialog';
import FormSkeleton from 'src/components/FormSkeleton';

function EditForm(props: { id?: string }) {
	// Props
	const { id } = props;
	const edit = Boolean(Number(id)); // When no id is provided

	// States
	const initialValues: User = {
		name: '',
		last_name: '',
		id: 0,
		username: '',
		role: '',
		email: ''
	};
	const [values, setValues] = useState<User>(initialValues);
	const [validation, setValidation] = useState<UserValidation>({});
	const [editPassword, setEditPassword] = useState(!edit);
	const [saving, setSaving] = useState(false);
	const [isLoadingData, setIsLoading] = useState(false);

	// Hooks
	const rest = useRest();
	const navigate = useNavigate();
	const modalDialog = useModalDialog();

	// Fetch user data on mount and when id change
	useEffect(() => {
		// Create abort controller to cancel fetch request on unmount
		const controller = new AbortController();
		const signal = controller.signal;

		if (edit) {
			// Start loading process
			setIsLoading(true);

			// Fetch user data
			rest({ method: 'get', url: `user/${id}`, signal })
				.then(({ data }) => {
					// Set form data
					setValues(data);
				})
				.finally(() => {
					// End loading process
					setIsLoading(false);
				});

			setEditPassword(false);
		} else {
			setValues(initialValues);
			setEditPassword(true);
			setIsLoading(false);
		}

		return () => {
			controller.abort();
		};
	}, [id]);

	/**
	 * Change values state for the selected field
	 * @param field Field to change
	 */
	const handleChange = (prop: keyof User) => (event: React.ChangeEvent<HTMLInputElement>) => {
		// Email always in lowercase
		if (prop === 'email') {
			event.target.value = event.target.value.toLowerCase();
		}
		setValues({ ...values, [prop]: event.target.value });
		setValidation({ ...validation, [prop]: '' });
	};

	/**
	 * Submit changes
	 */
	const handleSave = () => {
		// Separate id from data
		const { id, ...data } = values;

		// Validate fields
		const temp: UserValidation = {};
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
		temp.role = values.role.length ? temp.role : 'This is a required field';
		temp.password = values.password?.length < 4 && editPassword ? 'Four characters at least' : temp.password;
		temp.password = !values.password?.length && editPassword ? 'This is a required field' : temp.password;
		setValidation({ ...temp });

		// Stop if some validation failed
		if (!Object.values(temp).every((x) => Boolean(x) === false)) {
			return;
		}

		// Start saving process
		setSaving(true);

		// Set rest parameters depending if it is edition or creation
		let method: string;
		let url: string;
		let actionName: string;
		if (edit) {
			method = 'patch';
			url = 'user/' + id;
			actionName = 'Edit';
			// Do not send password data if not meant to change it
			if (!editPassword) {
				delete data.password;
			}
		} else {
			method = 'post';
			url = 'user';
			actionName = 'New';
		}

		// Execute saving
		rest({ method, url, data })
			.then(async ({ data }) => {
				// Show success dialog, then go back
				await modalDialog({ type: 'success', title: `${actionName} user`, text: data.text });
				navigate(-1);
			})
			.catch(({ data }) => {
				// Show error dialog
				modalDialog({ type: 'error', title: `${actionName} user`, text: data });
			})
			.finally(() => {
				// End saving process
				setSaving(false);
			});
	};

	return (
		<Card>
			<CardContent
				sx={{
					display: 'flex',
					flexDirection: 'column',
					pt: 4
				}}
				component="form"
				noValidate
				onSubmit={(event: React.FormEvent) => {
					event.preventDefault();
					handleSave();
				}}
				autoComplete="on"
			>
				<Grid container direction="row" justifyContent="left" alignItems="flex-start" spacing={3}>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
							<TextField
								sx={{ width: '100%' }}
								error={Boolean(validation.name)}
								id="name"
								label="First name"
								helperText={validation.name}
								onChange={handleChange('name')}
								value={values.name}
								required
								autoFocus
							/>
						</FormSkeleton>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
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
						</FormSkeleton>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
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
						</FormSkeleton>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
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
						</FormSkeleton>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
							<FormControl fullWidth error={Boolean(validation.role)}>
								<InputLabel id="roleLabel">User role *</InputLabel>
								<Select labelId="roleLabel" id="role" value={values.role} label="User role" onChange={handleChange('role')} required>
									{userRolesList().map((userRole) => (
										<MenuItem key={'userRole_' + userRole.key} value={userRole.key}>
											{userRole.value}
										</MenuItem>
									))}
								</Select>
								<FormHelperText>{validation.role}</FormHelperText>
							</FormControl>
						</FormSkeleton>
					</Grid>
					<Grid item xs={12} sm={6}>
						<FormSkeleton loading={isLoadingData}>
							{editPassword || !edit ? (
								<Stack direction="row" spacing={2} alignItems="flex-Start">
									<TextField
										sx={{ width: '100%' }}
										error={Boolean(validation.password)}
										id="password"
										label="Password"
										helperText={validation.password}
										onChange={handleChange('password')}
										value={values.password ?? ''}
										autoFocus={editPassword && edit}
										required
									/>
									{edit && (
										<Button variant="outlined" sx={{ mt: '9px !important' }} onClick={() => setEditPassword(false)}>
											Cancel
										</Button>
									)}
								</Stack>
							) : (
								<Button sx={{ mt: '9px' }} variant="outlined" onClick={() => setEditPassword(true)}>
									Change password
								</Button>
							)}
						</FormSkeleton>
					</Grid>
				</Grid>
				<Stack direction="row" gap={2} sx={{ mt: 3 }} flexWrap="wrap">
					<ProgressButton variant="contained" type="submit" loading={saving}>
						Save
					</ProgressButton>
					<Button color="error" variant="outlined" disabled={saving} onClick={() => navigate(-1)}>
						Cancel
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default EditForm;
