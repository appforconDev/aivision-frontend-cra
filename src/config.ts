const raw = process.env.REACT_APP_BACKEND_URL;
if (!raw) {
  throw new Error("Missing env var REACT_APP_BACKEND_URL");
}

// Ensure we always have a string value
const backendUrl: string = raw.trim();

export default backendUrl;