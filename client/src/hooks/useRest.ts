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
					'%c%s%c /%s %c🡆%c %O %c🡄%c %O',
					'color: green; border: 1px solid green; padding: 0 2px',
					config.method.toUpperCase(),
					'color: inherit',
					config.url,
					'color: magenta',
					'color: inherit',
					config.data ?? '-',
					'color: cyan',
					'color: inherit',
					response
				);
			}

			return response;
		} catch (error) {
			// Log
			if (process.env.NODE_ENV !== 'production') {
				console.info(
					'%c%s%c /%s %c🡆%c %O %c🡄%c %O',
					'color: red; border: 1px solid red; padding: 0 2px',
					config.method.toUpperCase(),
					'color: inherit',
					config.url,
					'color: magenta',
					'color: inherit',
					config.data ?? '-',
					'color: cyan',
					'color: inherit',
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
						console.info(
							'%c%s%c %s%c %s %c🡄%c %O',
							'color: green; border: 1px solid green; padding: 0 2px',
							'GET',
							'color: olive',
							'Refreshing tokens',
							'color: inherit',
							'/auth/refresh',
							'color: cyan',
							'color: inherit',
							responseRefresh
						);
					}

					// Repeat original request
					return restFunction(config);
				} catch (refreshError) {
					// Unauthorized again, session closed
					if (Number(refreshError.response.status) === 401) {
						// Log
						if (process.env.NODE_ENV !== 'production') {
							console.info(
								'%c%s%c %s%c %s %c🡄%c %O',
								'color: red; border: 1px solid red; padding: 0 2px',
								'GET',
								'color: olive',
								'Refreshing tokens',
								'color: inherit',
								'/auth/refresh',
								'color: cyan',
								'color: inherit',
								refreshError
							);
						}

						// First show modal, then complete logout
						await modalDialog({ type: 'error', title: 'Unauthorized', text: 'A new log in is necessary.' });
						logOut();
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
