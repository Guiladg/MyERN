import { Typography, Grid } from '@mui/material';

function PageHeader(props: { id?: string }) {
	const { id } = props;

	return (
		<Grid container justifyContent="space-between" alignItems="center">
			<Grid item>
				<Typography variant="h3" component="h3" gutterBottom>
					Users
				</Typography>
				<Typography variant="subtitle2">{Number(id) ? 'Edit system user' : 'New system user'}</Typography>
			</Grid>
		</Grid>
	);
}

export default PageHeader;
