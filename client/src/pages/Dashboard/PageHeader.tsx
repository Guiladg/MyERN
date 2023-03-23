import { Typography, Grid } from '@mui/material';
import useAuth from 'src/contexts/Auth';

function PageHeader() {
	const auth = useAuth();

	return (
		<Grid container justifyContent="space-between" alignItems="center">
			<Grid item>
				<Typography variant="h3" component="h3" gutterBottom>
					Start
				</Typography>
				<Typography variant="subtitle2">Welcome back, {auth.user?.name ?? ''}.</Typography>
			</Grid>
		</Grid>
	);
}

export default PageHeader;
