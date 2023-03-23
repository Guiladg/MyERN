import { styled, Skeleton, SkeletonProps } from '@mui/material';
import { ReactNode } from 'react';

const StyledSkeleton = styled((props: SkeletonProps) => <Skeleton {...props} />)(() => ({
	transform: 'none',
	height: '100%',
	width: '100%'
}));

type FormSkeletonProps = SkeletonProps & { loading?: boolean; children?: ReactNode };

function FormSkeleton({ loading, children, sx, ...restProps }: FormSkeletonProps) {
	return children ? (
		loading !== false ? (
			<div style={{ position: 'relative' }}>
				<StyledSkeleton sx={{ ...sx, position: 'absolute' }} {...restProps} />
				<div style={{ opacity: Number(!loading) }}>{children}</div>
			</div>
		) : (
			<>{children}</>
		)
	) : (
		loading !== false && <StyledSkeleton sx={{ ...sx }} {...restProps} />
	);
}

export default FormSkeleton;
