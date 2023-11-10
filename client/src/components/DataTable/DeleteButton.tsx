import { Tooltip, IconButton, CircularProgress, useTheme } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

function DeleteButton({ disabled, onDelete, isDeleting }) {
	const theme = useTheme();

	return (
		<div style={{ position: 'relative' }}>
			<Tooltip title="Eliminar" arrow disableInteractive>
				<span>
					<IconButton
						sx={{
							'&:hover': { background: theme.colors.error.lighter },
							color: theme.palette.error.main
						}}
						color="inherit"
						size="small"
						onClick={onDelete}
						disabled={disabled}
					>
						<DeleteTwoToneIcon fontSize="small" />
					</IconButton>
				</span>
			</Tooltip>
			{isDeleting && <CircularProgress size={22} color="error" sx={{ position: 'absolute', left: 4, top: 4 }} />}
		</div>
	);
}
export default DeleteButton;
