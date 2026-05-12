import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface DashboardData {
  trustScore: number;
  role: 'developer' | 'client';
  activeProjects: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    clientName?: string;
    devName?: string;
  }>;
}

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      return (await apiClient.get(API_ENDPOINTS.dashboard.get)).data;
    }
  });
};

export interface ProfileData {
  name: string;
  title: string;
  score: number;
  stats: {
    commits: number;
    stars: number;
  };
  verifiedProjects: Array<{
    id: string;
    name: string;
    description: string;
    stack: string[];
  }>;
}

export const useProfileData = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<ProfileData> => {
      return (await apiClient.get(API_ENDPOINTS.profile.detail(userId))).data;
    },
    enabled: !!userId,
  });
};

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: string;
  logs: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    completedAt: string | null;
  }>;
}

export const useProjectData = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectData> => {
      return (await apiClient.get(API_ENDPOINTS.projects.detail(projectId))).data;
    },
    enabled: !!projectId
  });
};

export interface AuthorizedClient {
  id: string;
  companyName: string;
  contactName: string;
}

export const useAuthorizedClients = () => {
  return useQuery({
    queryKey: ['authorized-clients'],
    queryFn: async (): Promise<AuthorizedClient[]> => {
      return (await apiClient.get(API_ENDPOINTS.projects.authorizedClients)).data;
    }
  });
};

export const useLinkRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { repoUrl: string; clientId?: string }) => {
      return (await apiClient.post(API_ENDPOINTS.projects.link, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
};
