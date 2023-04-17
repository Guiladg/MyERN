import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Button, Container, Grid, Typography } from '@mui/material';
import Footer from 'src/components/Footer';
import ListTable from './ListTable';
import { NavLink } from 'react-router-dom';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

function List() {
	return (
		<>
			<Helmet>
				<title>Users</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid item>
						<Typography variant="h3" component="h3" gutterBottom>
							Users
						</Typography>
						<Typography variant="subtitle2">List of system users</Typography>
					</Grid>
					<Grid item>
						<Button sx={{ mt: { xs: 2, md: 0 } }} variant="contained" startIcon={<AddTwoToneIcon fontSize="small" />} component={NavLink} to="0">
							Create new
						</Button>
					</Grid>
				</Grid>
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<ListTable />
			</Container>
			<Footer />
		</>
	);
}

export default List;
