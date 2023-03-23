import { memo, useCallback, useMemo, useState } from 'react';
import { DataGrid, DataGridProps, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowId, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { useModalDialog } from 'src/contexts/ModalDialog';
import useRest from 'src/hooks/useRest';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import { alpha, lighten, useTheme } from '@mui/material';

export type ActionButton = 'delete' | 'edit' | 'duplicate';

export interface DataTableData {
	rows?: any[];
	rowCount?: number;
	page?: number;
	size?: number;
	order?: string;
}

export interface DataTableProps extends Partial<DataGridProps> {
	id?: string;
	actions?: ActionButton[];
	deleteEndPoint?: string;
	noDelete?: number[];
	noEdit?: number[];
	data?: DataTableData;
}

function DataTable(props: DataTableProps) {
	// Hooks
	const modalDialog = useModalDialog();
	const rest = useRest();

	// Props
	const { data, id, columns, actions, deleteEndPoint, noDelete, noEdit, onSortModelChange, onPaginationModelChange, ...restProps } = props;
	const noDeleteArray: number[] = [].concat(noDelete);
	const noEditArray: number[] = [].concat(noEdit);
	const rows = data?.rows ?? [];

	// States
	const [deletedIds, setDeletedIds] = useState<GridRowId[]>([]);
	const [deleting, setDeleting] = useState<GridRowId>(0);
	const [processing, setProcessing] = useState(false);

	/**
	 * Delete the row of the specified id from the specified API
	 * @param rowId id of the row to delete
	 */
	const handleDelete =
		(rowId: number) =>
		(event: React.MouseEvent<HTMLButtonElement>): void => {
			event.stopPropagation(); // don't select this row after clicking
			modalDialog({
				type: 'confirm',
				title: 'Delete record',
				text: 'Please confirm you want to delete this record.'
			}).then(() => {
				setDeleting(rowId);
				setProcessing(true);
				rest({ method: 'delete', url: `${deleteEndPoint}/${rowId}` })
					.then(({ data }) => {
						// Carga los datos para su filtrado
						setDeletedIds([rowId, ...deletedIds]);
						modalDialog({ type: 'success', title: 'Delete record', text: data.text });
					})
					.catch(({ data }) => {
						modalDialog({ type: 'error', title: 'Delete record', text: data });
					})
					.finally(() => {
						setDeleting(0);
						setProcessing(false);
					});
			});
		};

	// Memoed columns
	const renderColumns = useMemo(() => {
		// An actions column exists in the props
		const existingActionsColumn: GridColDef = columns.find((col) => col.field === 'actions');

		// Create a new array of columns without the existing actions column from props
		let newColumns = [...columns.filter((col) => col !== existingActionsColumn)];

		// Create a new action column when actions are set in props or when an action column is defined
		let newActionColumn: GridColDef;
		if (actions?.length || existingActionsColumn) {
			newActionColumn = {
				field: 'actions',
				headerName: '',
				sortable: false,
				hideable: false,
				filterable: false,
				align: 'center',
				disableColumnMenu: true,
				renderCell: (params: GridRenderCellParams) => {
					const rowId = params.id as number;
					return (
						<>
							{/* Actions column content set in props */}
							{existingActionsColumn?.renderCell(params)}
							{/* Edit button if set and id not excluded */}
							{actions?.includes('edit') && <EditButton id={rowId} disabled={processing || noEditArray.includes(rowId)} />}
							{/* Delete button if set and id not excluded */}
							{actions?.includes('delete') && (
								<DeleteButton isDeleting={deleting === rowId} onDelete={handleDelete(rowId)} disabled={processing || noDeleteArray.includes(rowId)} />
							)}
						</>
					);
				}
			};

			// Add new actions column
			newColumns = [...newColumns, newActionColumn];
		}

		return newColumns;
	}, [JSON.stringify(columns), JSON.stringify(actions)]);

	// Memoed rows
	const renderRows = useMemo(() => {
		let newRows = [];

		// If there is an id set in props, add it to the column
		if (id != undefined && id.toLowerCase() !== 'id') {
			newRows = rows.map((row: { [key: string]: any }) => ({ id: row[id], ...row }));
		} else {
			newRows = [...rows];
		}

		// If there are deleted rows, remove them
		if (deletedIds.length) {
			newRows = newRows.filter((row) => !deletedIds.includes(row.id));
		}

		return newRows;
	}, [JSON.stringify(data), JSON.stringify(deletedIds)]);

	// Memoed sort model
	const renderSortModel = useMemo(() => {
		let defaultSortModel: GridSortModel;
		if (data?.order) {
			const defaultSortOpts = data.order.split(' ');
			const defaultSortField = defaultSortOpts[0];
			const defaultSortOrder = (defaultSortOpts[1] as GridSortDirection) ?? 'asc';
			defaultSortModel = [{ field: defaultSortField, sort: defaultSortOrder }];
		}
		return defaultSortModel;
	}, [JSON.stringify(data)]);

	// Memoed page model
	const renderPageModel = useMemo(() => {
		let defaultPageModel: GridPaginationModel;
		if (data?.page != undefined && data?.size) {
			defaultPageModel = { page: data.page, pageSize: data.size };
		}
		return defaultPageModel;
	}, [JSON.stringify(data)]);

	// Prevent rerendering
	const callbackOnSortModelChange = useCallback(onSortModelChange, []);
	const callbackOnPaginationModelChange = useCallback(onPaginationModelChange, []);

	return (
		<MemoedDataGrid
			{...restProps}
			rows={renderRows}
			columns={renderColumns}
			sortModel={renderSortModel}
			paginationModel={renderPageModel}
			rowCount={data?.rowCount || 0}
			onPaginationModelChange={callbackOnPaginationModelChange}
			onSortModelChange={callbackOnSortModelChange}
		/>
	);
}

const MemoedDataGrid = memo(function (props: DataGridProps) {
	// Props
	const { disableColumnMenu, disableColumnSelector, disableRowSelectionOnClick, autoHeight } = props;

	// Hooks
	const theme = useTheme();

	return (
		<DataGrid
			{...props}
			autoHeight={autoHeight ?? true}
			disableRowSelectionOnClick={disableRowSelectionOnClick ?? true}
			disableColumnSelector={disableColumnSelector ?? true}
			disableColumnMenu={disableColumnMenu ?? true}
			sortingOrder={['desc', 'asc']}
			pageSizeOptions={[10, 50, 100]}
			paginationMode="server"
			sortingMode="server"
			sx={{
				border: 0,
				'& .MuiDataGrid-columnHeaders': {
					backgroundColor: lighten(theme.colors.primary.main, 0.7)
				},
				'& .MuiDataGrid-row:nth-of-type(odd)': {
					backgroundColor: lighten(theme.colors.primary.main, 0.98)
				},
				'& .MuiDataGrid-row:hover': {
					backgroundColor: theme.colors.secondary.lighter
				},
				...props.sx, // previous styles can be overridden
				'& .MuiDataGrid-columnHeader:last-child > .MuiDataGrid-columnSeparator': {
					visibility: 'hidden'
				},
				'& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus': {
					outline: 'none'
				}
			}}
		/>
	);
});

export default DataTable;
