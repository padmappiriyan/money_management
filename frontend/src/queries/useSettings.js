import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '../api/settingsApi';

// PLATFORMS
export const useActivePlatforms = () => {
  return useQuery({
    queryKey: ['activePlatforms'],
    queryFn: async () => {
      const response = await settingsApi.getActivePlatforms();
      return response.platforms;
    },
  });
};

export const useAllPlatforms = () => {
  return useQuery({
    queryKey: ['allPlatforms'],
    queryFn: async () => {
      const response = await settingsApi.getAllPlatforms();
      return response.platforms;
    },
  });
};

export const useAddPlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await settingsApi.createPlatform(formData);
      return response.platform;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPlatforms'] });
      queryClient.invalidateQueries({ queryKey: ['activePlatforms'] });
    },
  });
};

export const useModifyPlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await settingsApi.updatePlatform(id, formData);
      return response.platform;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPlatforms'] });
      queryClient.invalidateQueries({ queryKey: ['activePlatforms'] });
    },
  });
};

export const useRemovePlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await settingsApi.deletePlatform(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPlatforms'] });
      queryClient.invalidateQueries({ queryKey: ['activePlatforms'] });
    },
  });
};

// RATES
export const useGlobalRates = () => {
  return useQuery({
    queryKey: ['globalRates'],
    queryFn: async () => {
      const response = await settingsApi.getGlobalRates();
      return response.rates;
    },
  });
};

export const useUpdateGlobalRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rateData) => {
      const response = await settingsApi.upsertGlobalRate(rateData);
      return response.rate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalRates'] });
    },
  });
};

export const useSyncGlobalRates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await settingsApi.syncRatesWithExternal();
      return response.rates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalRates'] });
    },
  });
};
