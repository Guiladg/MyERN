import { Typography, Button, Grid } from '@mui/material';

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useNavigate } from 'react-router-dom';

function PageHeader() {
	const navigate = useNavigate();

	return (
		<Grid container justifyContent="space-between" alignItems="center">
			<Grid item>
				<Typography variant="h3" component="h3" gutterBottom>
					Users
				</Typography>
				<Typography variant="subtitle2">List of system users</Typography>
			</Grid>
			<Grid item>
				<Button sx={{ mt: { xs: 2, md: 0 } }} variant="contained" startIcon={<AddTwoToneIcon fontSize="small" />} onClick={() => navigate('0')}>
					Create new
				</Button>
			</Grid>
		</Grid>
	);
}

export default PageHeader;
