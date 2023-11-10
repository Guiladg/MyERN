import { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router';
import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';
import SuspenseLoader from 'src/components/SuspenseLoader';

const Loader = (Component: any) => (props: any) => (
	<Suspense fallback={<SuspenseLoader />}>
		<Component {...props} />
	</Suspense>
);

// Not found
const NotFound = Loader(lazy(() => import('src/pages/NotFound')));

// Login
const LoginPage = Loader(lazy(() => import('./pages/Login')));

// Dashboard
const Dashboard = Loader(lazy(() => import('src/pages/Dashboard')));

// Users
const UserList = Loader(lazy(() => import('src/pages/User/List')));
const UserForm = Loader(lazy(() => import('src/pages/User/Form')));

const routes: RouteObject[] = [
	{
		path: '*',
		element: (
			<BaseLayout>
				<NotFound />
			</BaseLayout>
		)
	},
	{
		path: process.env.REACT_APP_BASEDIR,
		element: <SidebarLayout />,
		children: [
			{
				path: '',
				element: <Dashboard />
			},
			{
				path: 'user',
				children: [
					{
						path: '',
						element: <UserList />
					},
					{
						path: ':id',
						element: <UserForm />
					}
				]
			}
		]
	},
	{
		path: process.env.REACT_APP_BASEDIR,
		element: <BaseLayout />,
		children: [
			{
				path: 'login',
				element: <LoginPage />
			}
		]
	}
];

export default routes;
