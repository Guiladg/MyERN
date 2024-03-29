/** Standardized response object for sending data to client */
export interface ClientList {
	records: any[];
	totalRecords: number;
	page: number;
	pageSize: number;
	order: string;
}
