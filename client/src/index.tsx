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

ReactDOMClient.createRoot(document.getElementById('root')).render(
	<HelmetProvider>
		<BrowserRouter>
			<AuthProvider>
				<SidebarProvider>
					<ThemeProvider>
						<CssBaseline />
						<ModalDialogProvider>
							<App />
						</ModalDialogProvider>
					</ThemeProvider>
				</SidebarProvider>
			</AuthProvider>
		</BrowserRouter>
	</HelmetProvider>
);

serviceWorker.unregister();
