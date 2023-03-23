import { Button, ButtonProps, CircularProgress, Box, SxProps } from '@mui/material';

interface ProgressButtonProps extends ButtonProps {
	loading: boolean;
}
interface gg {
	a: any;
	b: any;
}
function ProgressButton(props: ProgressButtonProps) {
	const { endIcon, startIcon, children, loading, disabled, sx, ...buttonProps } = props;

	const { m, margin, mt, marginTop, mr, marginRight, mb, marginBottom, ml, marginLeft, mx, marginX, my, marginY, position, width, height, ...style } =
		(sx as any) ?? {};

	const boxStyle = { m, margin, mt, marginTop, mr, marginRight, mb, marginBottom, ml, marginLeft, mx, marginX, my, marginY, width, height };

	const normalStyle = {
		transition: 'all 300ms, opacity 0s',
		position: 'absolute',
		width: '100%',
		height: '100%',
		margin: 'auto',
		left: 0,
		right: 0,
		opacity: 0,
		...style
	};

	const loadingStyle = {
		transition: 'all 300ms, opacity 0s',
		position: 'absolute',
		width: 'auto',
		height: '100%',
		margin: 'auto',
		left: 0,
		right: 0,
		borderRadius: '50%',
		aspectRatio: '1 / 1',
		minWidth: 0,
		opacity: buttonProps?.variant !== 'outlined' ? '0.2' : 1,
		overflow: 'hidden',
		...style
	};

	return (
		<Box sx={{ display: 'block', position: 'relative', ...boxStyle }}>
			<Button
				{...buttonProps}
				type="button"
				onClick={() => false}
				sx={loading ? loadingStyle : normalStyle}
				variant={buttonProps?.variant === 'outlined' ? 'outlined' : 'contained'}
			></Button>
			<Button
				{...buttonProps}
				disabled={loading || disabled}
				startIcon={startIcon}
				endIcon={endIcon}
				sx={{
					transition: 'all 100ms',
					opacity: loading ? 0 : 1,
					width: '100%',
					height: '100%',
					...style
				}}
			>
				{children}
			</Button>
			{loading && (
				<CircularProgress
					size={24}
					color={buttonProps?.color}
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						marginTop: '-12px',
						marginLeft: '-12px'
					}}
				/>
			)}
		</Box>
	);
}

export default ProgressButton;
