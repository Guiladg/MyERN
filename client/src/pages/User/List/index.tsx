import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container } from '@mui/material';
import Footer from 'src/components/Footer';

import ListTable from './ListTable';

function List() {
	return (
		<>
			<Helmet>
				<title>Users</title>
			</Helmet>
			<PageTitleWrapper>
				<PageHeader />
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<ListTable />
			</Container>
			<Footer />
		</>
	);
}

export default List;
