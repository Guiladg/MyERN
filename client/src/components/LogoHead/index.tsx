import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import logoIMG from '../../assets/logo_head_2x.png';

const LogoWrapper = styled(Link)(
	({ theme }) => `
		padding: ${theme.spacing(0, 1)};
		display: block;
		height: 38px;
`
);

function Logo() {
	return (
		<LogoWrapper to={`/${process.env.REACT_APP_BASEDIR}`}>
			<img src={logoIMG} style={{ height: '100%' }} />
		</LogoWrapper>
	);
}

export default Logo;
