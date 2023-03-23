import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { User } from 'src/models/user';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface AuthContextType {
	user?: User;
	loading: boolean;
	logIn: (loginData: { username: string; password: string }) => Promise<string>;
	logOut: () => void;
	restorePassword: (email: string) => Promise<string>;
	changePassword: (data: { oldPassword: string; newPassword: string; newPassword2?: string }) => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider to wrap the entire app with it
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
	// Hooks
	const navigate = useNavigate();

	// States
	const [user, setUser] = useState<User>();
	const [loading, setLoading] = useState<boolean>(false);

	// On load check if there is a user saved in local storage, otherwise ask for log in
	// If there is a user saved in local storage, validate current authentication token
	// If validation fails, try to refresh, otherwise logout
	useEffect(() => {
		const actualUser = localStorage.getItem('user');
		if (actualUser) {
			setLoading(true);
			// Validate authentication token
			axios
				.get('auth/validate')
				.then(() => setUser(JSON.parse(actualUser)))
				.catch(() => {
					// log
					if (process.env.NODE_ENV !== 'production') {
						console.error('Token validation error');
						console.warn('Trying to refresh tokens');
					}
					// Refresh tokens
					axios
						.get('/auth/refresh')
						.then(() => setUser(JSON.parse(actualUser)))
						.catch(() => logOut())
						.finally(() => setLoading(false));
				})
				.finally(() => setLoading(false));
		} else {
			navigate(process.env.REACT_APP_BASEDIR + '/login');
		}
	}, []);

	/**
	 * Prevent errors when response has no text
	 */
	function okText(response: AxiosResponse): string {
		const text = response?.data ?? 'OK';
		return text;
	}
	function errorText(error: AxiosError): string {
		const text = error?.response?.data ?? 'Error';
		return text as string;
	}

	/**
	 * Log in through API
	 * @param loginData Object with username and password strings
	 * @returns text from API response
	 */
	function logIn(loginData: { username: string; password: string }): Promise<string> {
		return new Promise((resolve, reject) => {
			setLoading(true);

			axios
				.post('auth/login', loginData)
				.then((response) => {
					setUser(response.data);
					localStorage.setItem('user', JSON.stringify(response.data));
					navigate(process.env.REACT_APP_BASEDIR);
					resolve(okText(response));
				})
				.catch((error) => reject(errorText(error)))
				.finally(() => setLoading(false));
		});
	}

	/**
	 * Log out through API
	 */
	function logOut() {
		setLoading(true);
		axios.post('auth/logout', {}).finally(() => {
			setLoading(false);
			setUser(undefined);
			localStorage.removeItem('user');
			navigate(process.env.REACT_APP_BASEDIR + '/login');
		});
	}

	/**
	 * Start the password reset process through API
	 * @param email User email address to send restoration link
	 * @returns API response text
	 */
	function restorePassword(email: string): Promise<string> {
		setLoading(true);
		return new Promise((resolve, reject) => {
			axios
				.post(process.env.REACT_APP_API_ROUTE + 'auth/reset', { email: email })
				.then((response) => resolve(okText(response)))
				.catch((error) => reject(errorText(error)))
				.finally(() => setLoading(false));
		});
	}

	/**
	 * Reset user password through API
	 * @param data Object with old and new passwords
	 * @returns API response text
	 */
	function changePassword(data: { oldPassword: string; newPassword: string; newPassword2?: string }): Promise<string> {
		setLoading(true);
		return new Promise((resolve, reject) => {
			axios
				.post('auth/change', data)
				.then((response) => resolve(okText(response)))
				.catch((error) => reject(errorText(error)))
				.finally(() => setLoading(false));
		});
	}

	// Make the provider update only when it should
	const memoedValue = useMemo(
		() => ({
			user,
			loading,
			logIn,
			logOut,
			restorePassword,
			changePassword
		}),
		[user, loading]
	);

	// If nothing fails, show children
	return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
}

// Export hook
export default function useAuth() {
	return useContext(AuthContext);
}
