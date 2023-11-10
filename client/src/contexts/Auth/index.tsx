import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { User } from 'src/models/user';
import axios, { AxiosError, AxiosResponse } from 'axios';
import joinPath from 'src/utils/path';
import useRest from 'src/hooks/useRest';

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
	const rest = useRest();

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
			// Validate authentication token and get user data
			rest({ method: 'get', url: 'auth/user' })
				.then((data) => setUser(data))
				.finally(() => setLoading(false));
		} else {
			navigate(joinPath('/', process.env.REACT_APP_BASEDIR, '/login'));
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

			axios({ method: 'post', url: 'auth/login', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true, data: loginData })
				.then((response) => {
					setUser(response.data);
					localStorage.setItem('user', JSON.stringify(response.data));
					navigate(joinPath('/', process.env.REACT_APP_BASEDIR));
					resolve(okText(response));
				})
				.catch((error) => reject(errorText(error)))
				.finally(() => setLoading(false));
		});
	}

	/**
	 * Log out through API and locally
	 */
	function logOut() {
		setLoading(true);
		axios({ method: 'post', url: 'auth/logout', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true }).finally(() => {
			setLoading(false);
			setUser(undefined);
			// Remove saved user
			localStorage.removeItem('user');
			// Remove all cookies
			document.cookie.split(';').forEach((cookie) => {
				document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
			});
			// Go to login page
			window.location.href = joinPath(process.env.REACT_APP_BASEURL, process.env.REACT_APP_BASEDIR, '/login');
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
			axios({ method: 'post', url: 'auth/reset', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true, data: { email: email } })
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
			axios({ method: 'post', url: 'auth/change', baseURL: process.env.REACT_APP_API_ROUTE, withCredentials: true, data })
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
