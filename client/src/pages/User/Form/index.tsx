import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container } from '@mui/material';
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
				<PageHeader id={id} />
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<EditForm id={id} />
			</Container>
			<Footer />
		</>
	);
}

export default Form;
