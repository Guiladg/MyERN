import { useState, useEffect, ReactNode } from 'react';
import { Stack, Button, Card, CardContent, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, SelectChangeEvent } from '@mui/material';
import useRest from 'src/hooks/useRest';
import { User, userRoles, userRolesLabel } from 'src/models/user';
import ProgressButton from 'src/components/ProgressButton';
import { useNavigate } from 'react-router-dom';
import { useModalDialog } from 'src/contexts/ModalDialog';
import FormSkeleton from 'src/components/FormSkeleton';
import { Validate } from 'src/utils/types';

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
		role: '' as 'ADMIN',
		email: ''
	};
	const [values, setValues] = useState<User>(initialValues);
	const [validation, setValidation] = useState<Validate<User>>({});
	const [editPassword, setEditPassword] = useState(!edit);
	const [saving, setSaving] = useState(false);
	const [isLoadingData, setIsLoading] = useState(true);

	// Hooks
	const rest = useRest();
	const navigate = useNavigate();
	const modalDialog = useModalDialog();

	// Set rest parameters depending if it is edition or creation
	let method: string;
	let url: string;
	let actionName: string;
	if (edit) {
		method = 'patch';
		url = 'user/' + id;
		actionName = 'Editar usuario';
	} else {
		method = 'post';
		url = 'user';
		actionName = 'Nuevo usuario';
	}

	// Fetch user data on mount and when id change
	useEffect(() => {
		// Create abort controller to cancel fetch request on unmount
		const controller = new AbortController();
		const signal = controller.signal;

		// Start loading process
		setIsLoading(true);
		try {
			(async (signal) => {
				// Fetch user data if id is provided
				if (Number(id)) {
					const data = await rest({ method: 'get', url: `user/${id}`, signal });
					setValues(data);
					setEditPassword(false);
				} else {
					setValues(initialValues);
				}
				// Finish loading process
				setIsLoading(false);
			})(signal);
		} catch {
			// Show error dialog
			modalDialog({ type: 'error', title: actionName, text: 'Error inesperado' });
		}

		// Abort fetch on unmount
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
		const temp: Validate<User> = {};
		temp.name = values.name.length ? temp.name : 'Este campo es obligatorio';
		temp.last_name = values.last_name.length ? temp.last_name : 'Este campo es obligatorio';
		temp.username = values.username.length ? temp.username : 'Este campo es obligatorio';
		temp.email =
			/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
				values.email
			)
				? temp.email
				: 'Dirección de email incorrecta';
		temp.email = values.email.length ? temp.email : 'Este campo es obligatorio';
		temp.role = values.role.length ? temp.role : 'Este campo es obligatorio';
		temp.password = values.password?.length < 4 && editPassword ? '4 caracteres como mínimo' : temp.password;
		temp.password = !values.password?.length && editPassword ? 'Este campo es obligatorio' : temp.password;
		setValidation({ ...temp });

		// Stop if some validation failed
		if (!Object.values(temp).every((x) => Boolean(x) === false)) {
			return;
		}

		// Start saving process
		setSaving(true);

		// Do not send password data if not meant to change it
		if (edit && !editPassword) {
			delete data.password;
		}

		// Execute saving
		rest({ method, url, data })
			.then(async ({ text }) => {
				// Show success dialog, then go back
				await modalDialog({ type: 'success', title: actionName, text });
				navigate(-1);
			})
			.catch(({ text }) => {
				// Show error dialog
				modalDialog({ type: 'error', title: actionName, text });
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
								label="Nombre"
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
								label="Apellido"
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
								label="Nombre de usuario"
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
								<InputLabel id="roleLabel">Rol de usuario *</InputLabel>
								<Select labelId="roleLabel" id="role" value={values.role} label="Rol de usuario" onChange={handleChange('role')} required>
									{userRoles.map((userRole) => (
										<MenuItem key={'userRole_' + userRole} value={userRole}>
											{userRolesLabel[userRole]}
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
										label="Contraseña"
										helperText={validation.password}
										onChange={handleChange('password')}
										value={values.password ?? ''}
										autoFocus={editPassword && edit}
										required
									/>
									{edit && (
										<Button variant="outlined" sx={{ mt: '9px !important' }} onClick={() => setEditPassword(false)}>
											Cancelar
										</Button>
									)}
								</Stack>
							) : (
								<Button sx={{ mt: '9px' }} variant="outlined" onClick={() => setEditPassword(true)}>
									Cambiar contraseña
								</Button>
							)}
						</FormSkeleton>
					</Grid>
				</Grid>
				<Stack direction="row" gap={2} sx={{ mt: 3 }} flexWrap="wrap">
					<ProgressButton variant="contained" type="submit" loading={saving}>
						Guardar
					</ProgressButton>
					<Button color="error" variant="outlined" disabled={saving} onClick={() => navigate(-1)}>
						Cancelar
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default EditForm;
