import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createTransaction, 
  getLedgerTransactions, 
  getTransactionById, 
  getTransactionStats 
} from '../api/transactionApi';

export const useLedgerTransactions = (params) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getLedgerTransactions(params),
    keepPreviousData: true,
  });
};

export const useTransactionStats = (params) => {
  return useQuery({
    queryKey: ['transactionStats', params],
    queryFn: () => getTransactionStats(params),
    keepPreviousData: true,
  });
};

export const useTransactionById = (id) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransactionById(id),
    enabled: !!id,
  });
};

export const useRecordTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Immediate invalidation (might catch fast workers)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['myBalances'] });
      
      // Delayed invalidation for eventual consistency (allows background workers to finish)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
        queryClient.invalidateQueries({ queryKey: ['myBalances'] });
      }, 1000);
    },
  });
};
