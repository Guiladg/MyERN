import App from './App';
import * as ReactDOMClient from 'react-dom/client';
import * as serviceWorker from './serviceWorker';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import ThemeProvider from './theme/ThemeProvider';
import { CssBaseline } from '@mui/material';
import { ModalDialogProvider } from './contexts/ModalDialog';
import { AuthProvider } from './contexts/Auth';
import axios from 'axios';

// Axios defaults config
// Add API route to fetch url if not already set
axios.defaults.baseURL = process.env.REACT_APP_API_ROUTE;
// Send cookies with every request
axios.defaults.withCredentials = true;

ReactDOMClient.createRoot(document.getElementById('root')).render(
	<HelmetProvider>
		<SidebarProvider>
			<BrowserRouter>
				<ThemeProvider>
					<CssBaseline />
					<ModalDialogProvider>
						<AuthProvider>
							<App />
						</AuthProvider>
					</ModalDialogProvider>
				</ThemeProvider>
			</BrowserRouter>
		</SidebarProvider>
	</HelmetProvider>
);

serviceWorker.unregister();
