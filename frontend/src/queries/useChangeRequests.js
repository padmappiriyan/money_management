import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createChangeRequest, 
  getChangeRequests, 
  getChangeRequestById,
  approveChangeRequest, 
  rejectChangeRequest,
  getChangeRequestAnalytics
} from '../api/changeRequestApi';

export const useChangeRequests = (params) => {
  return useQuery({
    queryKey: ['changeRequests', params],
    queryFn: () => getChangeRequests(params),
    keepPreviousData: true,
  });
};

export const useChangeRequestById = (id) => {
  return useQuery({
    queryKey: ['changeRequest', id],
    queryFn: () => getChangeRequestById(id),
    enabled: !!id,
  });
};

export const useChangeRequestAnalytics = () => {
  return useQuery({
    queryKey: ['changeRequestAnalytics'],
    queryFn: () => getChangeRequestAnalytics(),
  });
};

export const useRequestChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['changeRequestAnalytics'] });
    },
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemarks }) => approveChangeRequest(id, { adminRemarks }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['changeRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['changeRequestAnalytics'] });
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminRemarks }) => rejectChangeRequest(id, { adminRemarks }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['changeRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['changeRequestAnalytics'] });
    },
  });
};
