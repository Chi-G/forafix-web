/**
 * Prepends the base path to an asset URL if necessary.
 * Useful for subdirectory deployments like /forafix/
 */
export const baseAsset = (path: string): string => {
    // Remove leading slash from path if it exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Check if we are running in the /forafix environment
    // We check the window location or an environment variable
    // Check if we are running in the production environment or if the subdirectory is forced
    const isSubdirectory = import.meta.env.PROD || import.meta.env.VITE_APP_SUBDIRECTORY === 'true';

    if (isSubdirectory) {
        return `/forafix/${cleanPath}`;
    }

    return `/${cleanPath}`;
};
