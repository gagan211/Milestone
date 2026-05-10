import { useQuery } from '@tanstack/react-query';
// import { apiClient } from './client';

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
      // return (await apiClient.get('/dashboard')).data;
      // Mocking for now until backend is built:
      return new Promise(resolve => setTimeout(() => resolve({
        role: 'developer', // Toggle to 'client' to see client view
        trustScore: 85,
        activeProjects: [
          { id: '1', name: 'Web App Redesign', progress: 75, status: 'On Track', clientName: 'Acme Corp' },
          { id: '2', name: 'Brand Strategy', progress: 40, status: 'At Risk', clientName: 'Global Inc' },
        ]
      }), 500));
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
      // return (await apiClient.get(`/profile/${userId}`)).data;
      return new Promise(resolve => setTimeout(() => resolve({
        name: 'Gagan Khivesara',
        title: 'Full-Stack Rust & React Developer',
        score: 85,
        stats: { commits: 1245, stars: 42 },
        verifiedProjects: [
          { id: '1', name: 'Paper Trading Simulator', description: 'A real-time matching engine built in Rust with WebSockets.', stack: ['Rust', 'Tokio', 'React'] }
        ]
      }), 500));
    }
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
    hash: string;
    time: string;
    verified: boolean;
  }>;
}

export const useProjectData = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectData> => {
      // return (await apiClient.get(`/projects/${projectId}`)).data;
      return new Promise(resolve => setTimeout(() => resolve({
        id: projectId,
        name: 'Paper Trading Simulator',
        description: 'A highly concurrent matching engine with real-time websocket broadcasts and React dashboard.',
        status: 'Completed',
        logs: [
          { id: '1', title: 'Core Order Matching Engine', hash: 'e3f1a9c', time: '2 days ago', verified: true },
          { id: '2', title: 'Websocket Broadcaster', hash: '8b2c4f1', time: '5 days ago', verified: true },
          { id: '3', title: 'Initial Project Scaffold', hash: '1a93d0f', time: '1 week ago', verified: true },
        ]
      }), 500));
    }
  });
};
