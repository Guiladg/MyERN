import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Footer from 'src/components/Footer';
import { Container, Typography, Button, Grid } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { NavLink } from 'react-router-dom';
import ListTable from './ListTable';

function List() {
	return (
		<>
			<Helmet>
				<title>Usuarios</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid item>
						<Typography variant="h3" component="h3" gutterBottom>
							Usuarios
						</Typography>
						<Typography variant="subtitle2">Listado de usuarios del sistema</Typography>
					</Grid>
					<Grid item>
						<Button sx={{ mt: { xs: 2, md: 0 } }} variant="contained" startIcon={<AddTwoToneIcon fontSize="small" />} component={NavLink} to="0">
							Nuevo
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
