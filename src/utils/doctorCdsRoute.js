/**
 * Helper utility to construct the correct absolute/relative URL for Doctor CDS (Neo4j)
 * portal across local development (localhost:3000) and GitHub Pages subpath (/CareOBrain/).
 */
export const getDoctorCdsUrl = () => {
  if (typeof window === "undefined") return "./doctor-cds/";

  const pathname = window.location.pathname;
  let cleanPath = pathname;

  // If pathname ends with a file (e.g. index.html), strip the file name
  if (/\.[a-zA-Z0-9]+$/.test(cleanPath)) {
    cleanPath = cleanPath.substring(0, cleanPath.lastIndexOf("/") + 1);
  }

  // Ensure cleanPath ends with trailing slash
  if (!cleanPath.endsWith("/")) {
    cleanPath += "/";
  }

  return `${cleanPath}doctor-cds/`;
};
