import { useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useModalDialog } from '../contexts/ModalDialog';
import useAuth from 'src/contexts/Auth';

function useRest() {
	const { logOut } = useAuth();

	const modalDialog = useModalDialog();

	const restFunction = useCallback(async (config: AxiosRequestConfig = {}): Promise<AxiosResponse> => {
		try {
			// Fetch data
			const response = await axios(config);

			// Log
			if (process.env.NODE_ENV !== 'production') {
				console.info(
					'\x1B[32m%s\x1B[0m \x1B[37m/%s\x1B[0m \x1B[35m🡆\x1B[0m \x1B[37m%O\x1B[0m \x1B[36m🡄\x1B[0m %O',
					config.method.toUpperCase(),
					config.url,
					config.data ?? '-',
					response
				);
			}

			return response;
		} catch (error) {
			// Log
			if (process.env.NODE_ENV !== 'production') {
				console.error(
					'\x1B[31m%s\x1B[0m \x1B[37m/%s\x1B[0m \x1B[35m🡆\x1B[0m \x1B[37m%O\x1B[0m \x1B[36m🡄\x1B[0m %O',
					config.method.toUpperCase(),
					config.url,
					config.data ?? '-',
					error.response
				);
			}

			// No response, unexpected error
			if (!error?.response) {
				throw new Error('Unexpected error', { cause: error });
			}

			// Unauthorized or forbidden, try to refresh authorization token or logout
			if ([401, 403].includes(Number(error.response.status))) {
				try {
					// Refresh authorization token
					const responseRefresh = await axios({ method: 'GET', url: '/auth/refresh' });

					// Log
					if (process.env.NODE_ENV !== 'production') {
						console.warn('Trying to refresh tokens %O', responseRefresh);
					}

					// Repeat original request
					return restFunction(config);
				} catch (refreshError) {
					// Unauthorized again, session closed
					if (Number(refreshError.response.status) === 401) {
						// Log
						if (process.env.NODE_ENV !== 'production') {
							console.error('Session closed %O', refreshError);
						}

						// First show modal, then complete logout
						modalDialog({ type: 'error', title: 'Unauthorized', text: 'A new log in is necessary.' }).finally(() => logOut());
					}
				}
			}

			// Convert validation errors (array) to string
			if (Array.isArray(error.response?.data)) {
				error.response.data = error.response.data.map((singleError: any) => Object.values(singleError.constraints).join(', '));
			}

			throw error.response;
		}
	}, []);

	return restFunction;
}

export default useRest;
