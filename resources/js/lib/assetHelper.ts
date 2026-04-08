/**
 * Prepends the base path to an asset URL if necessary.
 * Useful for subdirectory deployments like /forafix/
 */
export const baseAsset = (path: string): string => {
    // Remove leading slash from path if it exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Determine the base path from VITE_APP_PATH or default to empty
    // VITE_APP_PATH is set in workflows (e.g., "/forafix" or "/forafix_staging")
    const basePath = import.meta.env.VITE_APP_PATH || "";
    
    // Construct the final URL
    // Ensure we don't have double slashes
    if (basePath) {
        return `${basePath}/${cleanPath}`;
    }

    return `/${cleanPath}`;
};
