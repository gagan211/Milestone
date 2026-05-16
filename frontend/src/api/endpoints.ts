export const API_ENDPOINTS = {
  auth: {
    sync: '/auth/sync',
  },
  dashboard: {
    get: '/projects/dashboard',
  },
  projects: {
    link: '/projects/link',
    detail: (id: string) => `/projects/${id}`,
    authorizedClients: '/projects/authorized-clients',
  },
  profile: {
    detail: (userId: string) => `/profile/${userId}`,
  }
};
