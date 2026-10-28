const isBrowser = typeof window !== "undefined";

export const isDev = process.env.NODE_ENV === "development";

// dev — локальный backend; prod в браузере — тот же домен (/api через reverse-proxy);
// prod на сервере — имя сервиса из docker-compose
export const apiURL = isDev
  ? "http://localhost:8001/api"
  : isBrowser
    ? "/api"
    : "http://backend:8000/api";
