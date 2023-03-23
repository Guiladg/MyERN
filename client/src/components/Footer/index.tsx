import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterWrapper = styled(Box)(
	({ theme }) => `
        border-radius: 0;
        margin: ${theme.spacing(3)} 0;
`
);

function Footer() {
	return (
		<FooterWrapper>
			<Container maxWidth="lg">
				<Box py={3} display={{ xs: 'block', md: 'flex' }} alignItems="center" textAlign={{ xs: 'center', md: 'left' }} justifyContent="space-between"></Box>
			</Container>
		</FooterWrapper>
	);
}

export default Footer;
