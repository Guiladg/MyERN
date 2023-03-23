import { Helmet } from 'react-helmet-async';
import { Container, Grid } from '@mui/material';
import LoginForm from 'src/components/LoginForm';
import logoIMG from 'src/assets/logo.png';

function LoginPage() {
	return (
		<>
			<Helmet>
				<title>Login</title>
			</Helmet>
			<Container maxWidth="lg" sx={{ height: '100%' }}>
				<Grid container direction="column" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
					<img src={logoIMG} style={{ maxWidth: '250px', marginBottom: '30px', marginTop: '-30px' }} />
					<LoginForm />
				</Grid>
			</Container>
		</>
	);
}

export default LoginPage;
