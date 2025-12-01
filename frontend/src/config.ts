export const API_BASE =
    import.meta.env.PROD
        ? (import.meta.env.VITE_API_BASE ?? "https://TTTBackend.onrender.com")
        : "/api";
