import { Tooltip, IconButton, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import CopyAllTwoToneIcon from '@mui/icons-material/CopyAllTwoTone';

function DuplicateButton({ id, disabled }) {
	const theme = useTheme();
	return (
		<Tooltip title="Duplicar" arrow disableInteractive>
			<span>
				<IconButton
					sx={{
						'&:hover': {
							background: theme.colors.secondary.lighter
						},
						color: theme.palette.secondary.main
					}}
					color="inherit"
					size="small"
					onClick={(e) => {
						e.stopPropagation(); // Do not select this row after clicking
					}}
					component={NavLink}
					to={`${String(id)}?duplo`}
					disabled={disabled}
				>
					<CopyAllTwoToneIcon fontSize="small" />
				</IconButton>
			</span>
		</Tooltip>
	);
}
export default DuplicateButton;
