import { useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { SidebarContext } from 'src/contexts/SidebarContext';
import Logo from 'src/components/LogoHead';

import { Box, Drawer, Hidden } from '@mui/material';

import { styled } from '@mui/material/styles';
import SidebarMenu from './SidebarMenu';

const SidebarWrapper = styled(Box)(
	({ theme }) => `
		width: ${theme.sidebar.width};
		color: ${theme.sidebar.textColor};
		background: ${theme.sidebar.background};
		box-shadow: ${theme.sidebar.boxShadow};
		height: 100%;

		@media (min-width: ${theme.breakpoints.values.lg}px) {
			position: fixed;
			z-index: 10;
		}
`
);

const TopSection = styled(Box)(
	({ theme }) => `
		display: flex;
		min-height: ${theme.header.height};
		max-height: ${theme.header.height};
		align-items: center;
		margin: 0 ${theme.spacing(2)} ${theme.spacing(2)};
		border-bottom: ${theme.sidebar.dividerBg} solid 1px;
`
);

const SidebarInner = styled(Box)(
	({ theme }) => `
		display: flex;
		flex-direction: column;
		flex-wrap: no-wrap;
		height: 100%;
		width: 100%;
`
);

function Sidebar() {
	const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
	const closeSidebar = () => toggleSidebar();

	return (
		<>
			<Hidden lgDown>
				<SidebarWrapper>
					<Scrollbars autoHide>
						<SidebarInner>
							<TopSection>
								<Logo />
							</TopSection>
							<SidebarMenu />
						</SidebarInner>
					</Scrollbars>
				</SidebarWrapper>
			</Hidden>
			<Hidden lgUp>
				<Drawer anchor="left" open={sidebarToggle} onClose={closeSidebar} variant="temporary" elevation={9}>
					<SidebarWrapper>
						<Scrollbars autoHide>
							<SidebarInner>
								<TopSection>
									<Logo />
								</TopSection>
								<SidebarMenu />
							</SidebarInner>
						</Scrollbars>
					</SidebarWrapper>
				</Drawer>
			</Hidden>
		</>
	);
}

export default Sidebar;
