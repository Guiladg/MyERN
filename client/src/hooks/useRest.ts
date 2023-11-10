import { useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import joinPath from 'src/utils/path';

/**
 * Global variable for storing refreshing tokens promise
 */
let refreshingTokens: Promise<AxiosResponse>;

function useRest() {
	/**
	 * Ask for new authorization and refresh tokens
	 * @returns Result of the refresh token API call
	 */
	const refreshTokens = async (): Promise<AxiosResponse> => {
		try {
			const response = await axios({ method: 'GET', url: '/auth/refresh', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true });

			// Log
			if (process.env.REACT_APP_ENV !== 'production') {
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
					response
				);
			}

			return response;
		} catch (error) {
			// Unauthorized again, session closed
			if (Number(error.response.status) === 401) {
				// Log
				if (process.env.REACT_APP_ENV !== 'production') {
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
						error.response
					);
				}
				throw 401;
			} else {
				// Unexpected error from server
				throw 400;
			}
		}
	};

	const restFunction = useCallback(async (config: AxiosRequestConfig = {}): Promise<any> => {
		// Add API route to fetch url if not already set
		config.baseURL = process.env.REACT_APP_API_ROUTE;
		// Send cookies with every request
		config.withCredentials = true;

		try {
			// Fetch data
			const response = await axios(config);

			// Log
			if (process.env.REACT_APP_ENV !== 'production') {
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

			return response.data;
		} catch (error) {
			// Log
			if (process.env.REACT_APP_ENV !== 'production') {
				console.info(
					'%c%s%c /%s %c🡆%c %O %c🡄%c %O %c%s%c',
					'color: red; border: 1px solid red; padding: 0 2px',
					config.method.toUpperCase(),
					'color: inherit',
					config.url,
					'color: magenta',
					'color: inherit',
					config.data ?? '-',
					'color: cyan',
					'color: inherit',
					error.response ?? '-',
					'color: red',
					axios.isCancel(error) ? '🛇' : '',
					'color: inherit'
				);
			}

			// Cancelled request
			if (axios.isCancel(error)) {
				return;
			}

			let text = '';

			// No response, unexpected error
			if (!error?.response) {
				text = 'Se produjo un error inesperado, por favor refresque el sitio.';
			}

			// Unauthorized try to refresh authorization token or logout
			if (Number(error.response.status) === 401) {
				// Refresh tokens only if there is no other refresh in progress
				// Multiple instances of useRest will wait for the same promise
				if (!refreshingTokens) {
					refreshingTokens = refreshTokens();
				}

				// If refresh fails (or an other refresh in progress fails), stop there
				try {
					await refreshingTokens;
					// Repeat original request
					return restFunction(config);
				} catch (e) {
					if (e === 401) {
						// Log out
						axios({ method: 'post', url: 'auth/logout', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true }).finally(() => {
							// Remove saved user
							localStorage.removeItem('user');
							// Remove all cookies
							document.cookie.split(';').forEach((cookie) => {
								document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
							});
							// Go to login page
							window.location.href = joinPath(process.env.REACT_APP_BASEURL, process.env.REACT_APP_BASEDIR, 'login');
						});
						text = 'Sesión finalizada';
					} else {
						text = 'Se produjo un error inesperado, por favor refresque el sitio.';
					}
				} finally {
					// Restart promise
					refreshingTokens = null;
				}
			} else if (Number(error.status) === 403) {
				text = 'El usuario actual no está autorizado a acceder a esta información.';
			} else if (Array.isArray(error.response?.data)) {
				// Convert validation errors (array) to string
				text = error.response.data.map((singleError: any) => Object.values(singleError.constraints).join('<br/>'));
			} else {
				text = error.response.data ?? 'Se produjo un error inesperado, por favor refresque el sitio.';
			}
			throw { text, status: error.status };
		}
	}, []);

	return restFunction;
}

export default useRest;
