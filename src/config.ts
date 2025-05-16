// src/config.ts
const raw = process.env.REACT_APP_BACKEND_URL;
if (!raw) {
  throw new Error("Missing env REACT_APP_BACKEND_URL");
}
const BACKEND_URL: string = raw;
export default BACKEND_URL;
