/**
 * Create a new interface based on T with all the properties optional and strings
 */
export type Validate<T> = { [K in keyof T]?: string };

/**
 * Create a new interface based on T excluding the properties in K
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create a new interface based on T with all the properties in K optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Create a new interface based on T with only properties of the types in U
 */
export type PickByType<T, U> = {
	[P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Create a union with the all property names in T with the types in U
 */
export type TypeInKeyOf<T, U> = keyof PickByType<T, U>;
