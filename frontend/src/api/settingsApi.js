import axiosInstance from './axiosInstance';

/**
 * SOURCE CLASSIFICATION (PLATFORMS) API
 */
export const getActivePlatforms = async () => {
  const response = await axiosInstance.get('/platforms');
  return response.data;
};

export const getAllPlatforms = async () => {
  const response = await axiosInstance.get('/platforms/admin');
  return response.data;
};

export const createPlatform = async (formData) => {
  const response = await axiosInstance.post('/platforms', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updatePlatform = async (id, formData) => {
  const response = await axiosInstance.put(`/platforms/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePlatform = async (id) => {
  const response = await axiosInstance.delete(`/platforms/${id}`);
  return response.data;
};

/**
 * GLOBAL EXCHANGE RATES API
 */
export const getGlobalRates = async () => {
  const response = await axiosInstance.get('/rates');
  return response.data;
};

export const upsertGlobalRate = async (rateData) => {
  const response = await axiosInstance.post('/rates', rateData);
  return response.data;
};

export const deleteGlobalRate = async (id) => {
  const response = await axiosInstance.delete(`/rates/${id}`);
  return response.data;
};

export const syncRatesWithExternal = async () => {
  const response = await axiosInstance.post('/rates/sync');
  return response.data;
};
