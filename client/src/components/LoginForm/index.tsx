import { useState } from 'react';
import { Card, CardHeader, Divider } from '@mui/material';
import Login from './Login';
import Restore from './Restore';

function LoginForm() {
	const [showRestore, setShowRestore] = useState(false);

	const handleShowRestore = () => setShowRestore(!showRestore);

	return (
		<Card sx={{ width: '300px' }}>
			<CardHeader title={showRestore ? 'Password reset' : 'Log in'} />
			<Divider />
			<Login visible={!showRestore} onShowRestore={handleShowRestore} />
			<Restore visible={showRestore} onShowRestore={handleShowRestore} />
		</Card>
	);
}

export default LoginForm;
