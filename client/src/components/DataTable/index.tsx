import { memo, useCallback, useMemo, useState } from 'react';
import { DataGrid, DataGridProps, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowId, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { useModalDialog } from 'src/contexts/ModalDialog';
import useRest from 'src/hooks/useRest';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import DuplicateButton from './DuplicateButton';
import { lighten, useTheme } from '@mui/material';
import deepmerge from 'deepmerge';

export type ActionButton = 'delete' | 'edit' | 'duplicate';

export interface DataTableData<T = any> {
	records?: T[];
	totalRecords?: number;
	page?: number;
	pageSize?: number;
	order?: string;
}

export interface DataTableProps extends Partial<DataGridProps> {
	id?: string;
	actions?: ActionButton[];
	deleteEndPoint?: string;
	editBaseURL?: string;
	noDelete?: number[];
	noEdit?: number[];
	data?: DataTableData;
}

function DataTable(props: DataTableProps) {
	// Hooks
	const modalDialog = useModalDialog();
	const rest = useRest();

	// Props
	const { data, id, columns, actions, deleteEndPoint, noDelete, noEdit, onSortModelChange, onPaginationModelChange, editBaseURL, ...restProps } = props;
	const noDeleteArray: number[] = [].concat(noDelete);
	const noEditArray: number[] = [].concat(noEdit);
	const records = data?.records ?? [];

	// States
	const [deletedIds, setDeletedIds] = useState<GridRowId[]>([]);
	const [deleting, setDeleting] = useState<GridRowId>(0);
	const [processing, setProcessing] = useState(false);
	const [reRender, setReRender] = useState(0);

	/**
	 * Delete the row of the specified id from the specified API
	 * @param rowId id of the row to delete
	 */
	const handleDelete =
		(rowId: number) =>
		async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
			event.stopPropagation(); // don't select this row after clicking
			if (
				await modalDialog({
					type: 'confirm',
					title: 'Eliminar registro',
					text: '¿Seguro que se desea eliminar el registro?<br/>Esta operación no puede deshacerse.'
				})
			) {
				setDeleting(rowId);
				setProcessing(true);
				rest({ method: 'delete', url: `${deleteEndPoint}/${rowId}` })
					.then(({ text }) => {
						// Carga los datos para su filtradoss
						setDeletedIds([rowId, ...deletedIds]);
						modalDialog({ type: 'success', title: 'Delete record', text: text });
					})
					.catch(({ text }) => {
						modalDialog({ type: 'error', title: 'Delete record', text });
					})
					.finally(() => {
						setDeleting(0);
						setProcessing(false);
					});
			}
		};

	// Action column
	const renderColumns = [...columns];
	// An actions column exists in the props
	const existingActionsColumn: GridColDef = columns.find((col) => col.field === 'actions');
	if (actions?.length || existingActionsColumn) {
		// Separate existing action column props
		const { renderCell: existingActionsColumnRender, ...existingActionsColumnProps } = existingActionsColumn ?? { renderCell: (params: any) => <></> };

		const newActionColumn: GridColDef = {
			field: 'actions',
			headerName: '',
			sortable: false,
			hideable: false,
			filterable: false,
			align: 'center',
			disableColumnMenu: true,
			minWidth: (actions?.length ?? 0) * 40,
			maxWidth: 500,
			flex: 0.5,
			type: 'actions',
			...existingActionsColumnProps,
			renderCell: (params: GridRenderCellParams) => {
				const rowId = params.id as number;
				return (
					<>
						{/* Actions column content set in props */}
						{existingActionsColumnRender(params)}
						{/* Edit button if set and id not excluded */}
						{actions?.includes('edit') && <EditButton id={rowId} disabled={processing || noEditArray.includes(rowId)} baseURL={editBaseURL} />}
						{/* Delete button if set and id not excluded */}
						{actions?.includes('delete') && (
							<DeleteButton isDeleting={deleting === rowId} onDelete={handleDelete(rowId)} disabled={processing || noDeleteArray.includes(rowId)} />
						)}
						{/* Duplicate button if set */}
						{actions?.includes('duplicate') && <DuplicateButton id={rowId} disabled={processing} />}
					</>
				);
			}
		};

		// Replace or add new actions column
		if (existingActionsColumn) {
			renderColumns[columns.findIndex((col) => col.field === 'actions')] = newActionColumn;
		} else {
			renderColumns.push(newActionColumn);
		}
	}

	// Memoed records
	const renderRows = useMemo(() => {
		let newRows = [];

		// If there is an id set in props, add it to the column
		if (id != undefined && id.toLowerCase() !== 'id') {
			newRows = records.map((row: { [key: string]: any }) => ({ id: row[id], ...row }));
		} else {
			newRows = [...records];
		}

		// If there are deleted records, remove them
		if (deletedIds.length) {
			newRows = newRows.filter((row) => !deletedIds.includes(row.id));
		}
		setReRender((r) => r + 1);
		return newRows;
	}, [JSON.stringify(data), JSON.stringify(deletedIds)]);

	// Memoed sort model
	const renderSortModel = useMemo(() => {
		let defaultSortModel: GridSortModel;
		if (data?.order && restProps.sortingMode !== 'client') {
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
		if (data?.page != undefined && data?.pageSize) {
			defaultPageModel = { page: data.page, pageSize: data.pageSize };
		}
		return defaultPageModel;
	}, [JSON.stringify(data)]);

	// Prevent rerendering
	const callbackOnSortModelChange = useCallback(onSortModelChange, []);
	const callbackOnPaginationModelChange = useCallback(onPaginationModelChange, []);

	return (
		<MemoedDataGrid
			reRender={reRender}
			rows={renderRows}
			columns={renderColumns}
			sortModel={renderSortModel}
			paginationModel={renderPageModel}
			rowCount={data?.totalRecords || 0}
			onPaginationModelChange={callbackOnPaginationModelChange}
			onSortModelChange={callbackOnSortModelChange}
			{...restProps}
		/>
	);
}

const MemoedDataGrid = memo(function (props: DataGridProps & { reRender: number }) {
	// Props
	const { disableColumnMenu, disableColumnSelector, disableRowSelectionOnClick, autoHeight, sx, ...restProps } = props;

	// Hooks
	const theme = useTheme();

	const defaultSx = {
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
		'& .MuiDataGrid-columnHeader:last-child > .MuiDataGrid-columnSeparator': {
			visibility: 'hidden'
		},
		'& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus': {
			outline: 'none'
		}
	};
	const combinedSx = deepmerge(defaultSx, (sx ?? {}) as any);

	return (
		<DataGrid
			autoHeight={autoHeight ?? true}
			disableRowSelectionOnClick={disableRowSelectionOnClick ?? true}
			disableColumnSelector={disableColumnSelector ?? true}
			disableColumnMenu={disableColumnMenu ?? true}
			sortingOrder={['desc', 'asc']}
			pageSizeOptions={[10, 50, 100]}
			paginationMode="server"
			sortingMode="server"
			sx={combinedSx}
			{...restProps}
		/>
	);
});

export default DataTable;
