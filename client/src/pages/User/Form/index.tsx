import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container, Grid, Typography } from '@mui/material';
import Footer from 'src/components/Footer';
import EditForm from './EditForm';
import { useParams } from 'react-router-dom';

function Form() {
	const { id } = useParams();

	return (
		<>
			<Helmet>
				<title>Usuarios</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid item>
						<Typography variant="h3" component="h3" gutterBottom>
							Usuario
						</Typography>
						<Typography variant="subtitle2">{Number(id) ? 'Editar usuario del sistema' : 'Nuevo usuario del sistema'}</Typography>
					</Grid>
				</Grid>
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<EditForm id={id} />
			</Container>
			<Footer />
		</>
	);
}

export default Form;
