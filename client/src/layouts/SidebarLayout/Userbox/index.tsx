import { useRef, useState } from 'react';
import { Box, Button, Divider, Hidden, lighten, List, ListItemButton, ListItemText, Popover, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import VpnKeyTwoToneIcon from '@mui/icons-material/VpnKeyTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import useAuth from 'src/contexts/Auth';
import { getUserRole } from 'src/models/user';
import PasswordModal from './PasswordModal';
import ProfileModal from './ProfileModal';

const UserBoxButton = styled(Button)(
	({ theme }) => `
				padding-left: ${theme.spacing(1)};
				padding-right: ${theme.spacing(1)};
				width: 100%;
`
);

const MenuUserBox = styled(Box)(
	({ theme }) => `
				background: ${theme.colors.alpha.black[5]};
				padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
	({ theme }) => `
				text-align: left;
				padding-left: ${theme.spacing(1)};
				margin-right: auto;
`
);

const UserBoxLabel = styled(Typography)(
	({ theme }) => `
				font-weight: ${theme.typography.fontWeightBold};
				color: ${theme.palette.secondary.main};
				display: block;
`
);

const UserBoxDescription = styled(Typography)(
	({ theme }) => `
				color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);

function HeaderUserbox() {
	// Hooks
	const { user: userData, logOut } = useAuth();

	// Refs
	const ref = useRef<any>(null);

	// States
	const [isOpen, setOpen] = useState(false);

	const [passwordModalOpen, setPasswordModalOpen] = useState(false);

	const [profileModalOpen, setProfileModalOpen] = useState(false);

	const handleOpen = (): void => {
		setOpen(true);
	};

	const handleClose = (): void => {
		setOpen(false);
	};

	const handleLogOut = (): void => {
		logOut();
	};

	const handleOpenPasswordModal = (): void => {
		handleClose();
		setPasswordModalOpen(true);
	};

	const handleClosePasswordModal = (): void => {
		setPasswordModalOpen(false);
	};

	const handleOpenProfileModal = (): void => {
		handleClose();
		setProfileModalOpen(true);
	};

	const handleCloseProfileModal = (): void => {
		setProfileModalOpen(false);
	};

	const user = {
		id: userData?.id ?? '',
		name: [userData?.name ?? '', userData?.last_name ?? ''].join(' '),
		role: userData?.role ? getUserRole(userData.role) : ''
	};

	return (
		<>
			<UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
				<Hidden mdDown>
					<UserBoxText>
						<UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
						<UserBoxDescription variant="body2">{user.role}</UserBoxDescription>
					</UserBoxText>
				</Hidden>
				<Hidden smDown>
					<ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
				</Hidden>
			</UserBoxButton>
			<Popover
				anchorEl={ref.current}
				onClose={handleClose}
				open={isOpen}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<MenuUserBox sx={{ minWidth: 210 }} display="flex">
					<UserBoxText>
						<UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
						<UserBoxDescription variant="body2">{user.role}</UserBoxDescription>
					</UserBoxText>
				</MenuUserBox>
				<Divider sx={{ mb: 0 }} />
				<List sx={{ p: 1 }} component="nav">
					<ListItemButton onClick={handleOpenProfileModal}>
						<AccountBoxTwoToneIcon fontSize="small" />
						<ListItemText primary="User profile" />
					</ListItemButton>
					<ListItemButton onClick={handleOpenPasswordModal}>
						<VpnKeyTwoToneIcon fontSize="small" />
						<ListItemText primary="Change password" />
					</ListItemButton>
				</List>
				<Divider />
				<List sx={{ p: 1 }} component="nav">
					<ListItemButton onClick={handleLogOut}>
						<LockOpenTwoToneIcon sx={{ mr: 1 }} />
						<ListItemText primary="Log out" />
					</ListItemButton>
				</List>
			</Popover>
			<ProfileModal open={profileModalOpen} onClose={handleCloseProfileModal} />
			<PasswordModal open={passwordModalOpen} onClose={handleClosePasswordModal} />
		</>
	);
}

export default HeaderUserbox;
