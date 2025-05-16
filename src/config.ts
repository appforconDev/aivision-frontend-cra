const raw = process.env.REACT_APP_BACKEND_URL;
if (!raw) {
  throw new Error("Missing env var REACT_APP_BACKEND_URL");
}

// Nu vet TypeScript att BACKEND_URL är en string
const backendUrl: string = raw;

export default backendUrl;