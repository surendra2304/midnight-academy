import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  secFetchSite: ["same-origin", "same-site", "cross-site", "none"],
  origin: () => true,
  referer: () => true,
  allowRequestsWithoutOriginCheck: true,
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}));
