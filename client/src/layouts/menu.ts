import { ReactNode } from 'react';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';

export interface MenuItem {
	link?: string;
	icon?: any;
	badge?: ReactNode;
	items?: MenuItem[];
	target?: string;
	name: string;
}

export interface MenuSection {
	items: MenuItem[];
	heading: string;
}

const menuItems: MenuSection[] = [
	{
		heading: 'Menu header',
		items: [
			{
				name: 'Users',
				icon: AccountCircleTwoToneIcon,
				link: process.env.REACT_APP_BASEURL + '/user'
			}
		]
	}
];

export default menuItems;
