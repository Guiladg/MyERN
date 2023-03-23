import { useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { GridRenderCellParams, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import Label from 'src/components/Label';
import useRest from 'src/hooks/useRest';
import { getUserRole } from 'src/models/user';
import DataTable from 'src/components/DataTable';
import useAuth from 'src/contexts/Auth';
import { useModalDialog } from 'src/contexts/ModalDialog';

function ListTable() {
	// States
	const [tableData, setTableData] = useState();
	const [isLoading, setIsLoading] = useState(false);
	const [pageModel, setPageModel] = useState<GridPaginationModel>();
	const [sortModel, setSortModel] = useState<GridSortModel>();

	// Hooks
	const rest = useRest();
	const auth = useAuth();
	const modalDialog = useModalDialog();

	// Fetch table data on mount and when page or sort models change
	useEffect(() => {
		// Create abort controller to cancel fetch request on unmount
		const controller = new AbortController();
		const signal = controller.signal;

		// Start loading process
		setIsLoading(true);

		// Define endpoint
		let url = 'user?';
		if (pageModel) {
			url = `${url}&page=${pageModel?.page}&size=${pageModel?.pageSize}`;
		}
		if (sortModel) {
			url = `${url}&sort=${sortModel?.[0]?.field}&order=${sortModel?.[0]?.sort}`;
		}

		// Fetch users data
		rest({
			method: 'get',
			url,
			signal
		})
			.then(({ data }) => {
				// Set table data states
				setTableData(data);
			})
			.catch(() => {
				// Show error dialog
				modalDialog({ type: 'error', title: 'Users list', text: 'Unexpected error' });
			})
			.finally(() => {
				// End loading process
				setIsLoading(false);
			});

		// Cancel fetching on unmount
		return () => controller.abort();
	}, [JSON.stringify(pageModel), JSON.stringify(sortModel)]);

	const columns: GridColDef[] = [
		{ field: 'full_name', headerName: 'Full name', flex: 2 },
		{ field: 'username', headerName: 'Username', flex: 1 },
		{ field: 'email', headerName: 'Email', flex: 1 },
		{
			field: 'role',
			headerName: 'Role',
			flex: 1,
			renderCell: (params: GridRenderCellParams) => <Label>{getUserRole(params.value)}</Label>
		}
	];

	return (
		<Card>
			<DataTable
				columns={columns}
				deleteEndPoint="user"
				actions={['edit', 'delete']}
				noDelete={[auth.user.id]}
				data={tableData}
				loading={isLoading}
				onPaginationModelChange={(model) => {
					setPageModel(model);
				}}
				onSortModelChange={(model) => {
					setSortModel(model);
				}}
			/>
		</Card>
	);
}

export default ListTable;
