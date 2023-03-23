import { Box, Typography, Container, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import TravelExploreTwoToneIcon from '@mui/icons-material/TravelExploreTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const MainContent = styled(Box)(
	({ theme }) => `
		height: 100%;
		display: flex;
		flex: 1;
		overflow: auto;
		flex-direction: column;
		align-items: center;
		justify-content: center;
`
);

function NotFound() {
	// Hooks
	const navigate = useNavigate();

	return (
		<>
			<Helmet>
				<title>Page not found</title>
			</Helmet>
			<MainContent>
				<Container maxWidth="md">
					<Box textAlign="center">
						<TravelExploreTwoToneIcon fontSize="large" />
						<Typography variant="h2" sx={{ my: 2 }}>
							Page not found
						</Typography>
						<Button onClick={() => navigate(-1)} startIcon={<ArrowBackTwoToneIcon fontSize="small" />}>
							Back
						</Button>
					</Box>
				</Container>
			</MainContent>
		</>
	);
}

export default NotFound;
