import { Tooltip, IconButton, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';

function EditButton({ id, disabled }) {
	const theme = useTheme();
	return (
		<Tooltip title="Edit" arrow disableInteractive>
			<span>
				<IconButton
					sx={{
						'&:hover': {
							background: theme.colors.primary.lighter
						},
						color: theme.palette.primary.main
					}}
					color="inherit"
					size="small"
					onClick={(e) => {
						e.stopPropagation(); // Do not select this row after clicking
					}}
					component={NavLink}
					to={String(id)}
					disabled={disabled}
				>
					<EditTwoToneIcon fontSize="small" />
				</IconButton>
			</span>
		</Tooltip>
	);
}
export default EditButton;
