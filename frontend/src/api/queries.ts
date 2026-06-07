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
    verificationStatus?: 'pending' | 'verified' | 'failed';
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
  id: string;
  name: string;
  title: string;
  score: number;
  stats: {
    commits: number;
    stars: number;
    totalMilestonesVerified: number;
    activeProjects: number;
  };
  profile_data: {
    layout: Array<{
      id: string;
      type: 'hero' | 'markdown' | 'project_showcase';
      content?: any;
    }>;
  };
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
  progress: number;
  repoUrl?: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'verified' | 'failed';
    completedAt: string | null;
    commitHash?: string;
    dueDate?: string;
  }>;
}

export const useProjectData = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectData> => {
      return (await apiClient.get(API_ENDPOINTS.projects.detail(projectId))).data;
    },
    enabled: !!projectId,
    refetchInterval: 30_000,
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

export const useUpdateProfile = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { profile_data: ProfileData['profile_data'] }) => {
      // Assuming a PUT or PATCH endpoint exists at /api/profile
      return (await apiClient.put(API_ENDPOINTS.profile.detail('me'), payload)).data;
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(['profile', userId], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  });
};
