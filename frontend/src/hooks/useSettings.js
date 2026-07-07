import { 
  useActivePlatforms, 
  useAllPlatforms, 
  useAddPlatform, 
  useModifyPlatform, 
  useRemovePlatform,
  useGlobalRates,
  useUpdateGlobalRate,
  useSyncGlobalRates
} from '../queries/useSettings';

const useSettings = () => {
    const { data: activePlatforms = [], isLoading: activeLoading, error: activeError } = useActivePlatforms();
    const { data: allPlatforms = [], isLoading: allLoading, error: allError, refetch: loadAllPlatforms } = useAllPlatforms();
    const { data: globalRates = [], isLoading: ratesLoading, error: ratesError, refetch: loadRates } = useGlobalRates();

    const { mutate: createPlatform } = useAddPlatform();
    const { mutate: updatePlatform } = useModifyPlatform();
    const { mutate: deletePlatform } = useRemovePlatform();
    const { mutate: upsertRate } = useUpdateGlobalRate();
    const { mutate: syncRates } = useSyncGlobalRates();

    const loading = activeLoading || allLoading || ratesLoading;
    const error = activeError || allError || ratesError;

    const resetStatus = () => {
        // React Query handles status internally, this is a no-op to avoid breaking components
    };

    const loadActivePlatforms = () => {}; // auto-fetched by useQuery

    return {
        // State
        activePlatforms,
        allPlatforms,
        globalRates,
        loading,
        error,
        success: false, // You might need to derive this from mutations if needed
        
        // Actions
        loadActivePlatforms,
        loadAllPlatforms,
        createPlatform,
        updatePlatform: (id, formData) => updatePlatform({ id, formData }),
        deletePlatform,
        loadRates,
        upsertRate,
        syncRates,
        resetStatus
    };
};

export default useSettings;
