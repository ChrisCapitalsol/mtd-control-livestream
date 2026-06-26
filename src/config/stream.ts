export const DEVELOPMENT_HLS_URL = "http://31.70.86.73:8890/live/stream/index.m3u8";
export const PRODUCTION_HLS_URL = "/hls/live/stream/index.m3u8";

export function getConfiguredHlsUrl() {
  const configured = import.meta.env.VITE_HLS_URL?.trim();
  if (configured) return configured;
  return import.meta.env.PROD ? PRODUCTION_HLS_URL : DEVELOPMENT_HLS_URL;
}
