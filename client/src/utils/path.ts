/**
 * A simple analog of Node.js's `joinPath(...)`.
 * https://gist.github.com/creationix/7435851#gistcomment-3698888
 * @param  {...string} segments
 * @return {string}
 */
export default function joinPath(...segments: string[]): string {
	const parts = segments.reduce((parts, segment = '') => {
		// Remove leading slashes from non-first part.
		if (parts.length > 0) {
			segment = segment?.replace(/^\//, '');
		}
		// Remove trailing slashes.
		segment = segment?.replace(/\/$/, '');
		return parts.concat(segment);
	}, []);
	const resultParts = [];
	for (const part of parts) {
		if (part === '.') {
			continue;
		}
		if (part === '..') {
			resultParts.pop();
			continue;
		}
		if (part === '') {
			continue;
		}
		resultParts.push(part);
	}
	return resultParts.join('/');
}
