import { useState, useCallback } from 'react';
import { getAllActivities } from '../api/activityApi';

const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch activities with search and paging
   */
  const fetchActivities = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllActivities(params);
      if (data.pagination.page === 1) {
        setActivities(data.data || []);
      } else {
        setActivities(prev => [...prev, ...(data.data || [])]);
      }
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    activities,
    pagination,
    isLoading,
    error,
    fetchActivities
  };
};

export default useActivities;
