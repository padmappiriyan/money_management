import { useQuery } from '@tanstack/react-query';
import { getMyPlatformBalances, getAllUsersBalances } from '../api/userBalanceApi';

export const useMyBalances = () => {
  return useQuery({
    queryKey: ['myBalances'],
    queryFn: () => getMyPlatformBalances(),
  });
};

export const useAllUsersBalances = (filters) => {
  return useQuery({
    queryKey: ['allUsersBalances', filters],
    queryFn: () => getAllUsersBalances(filters),
    keepPreviousData: true,
  });
};
