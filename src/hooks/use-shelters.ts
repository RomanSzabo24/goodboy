"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getShelters,
  getSheltersResults,
  postContribute,
  type ContributeBody,
} from "@/services/shelters";

export const sheltersKeys = {
  list: (search?: string) => ["shelters", "list", search] as const,
  results: (search?: string) => ["shelters", "results", search] as const,
};

export function useShelters(search?: string) {
  return useQuery({
    queryKey: sheltersKeys.list(search),
    queryFn: () => getShelters(search),
  });
}

export function useSheltersResults(search?: string) {
  return useQuery({
    queryKey: sheltersKeys.results(search),
    queryFn: () => getSheltersResults(search),
    refetchInterval: 30_000,
  });
}

export function useContribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ContributeBody) => postContribute(body),
    onSuccess: (data) => {
      if (data.messages.some((message) => message.type === "ERROR")) return;
      queryClient.invalidateQueries({ queryKey: ["shelters", "results"] });
    },
  });
}
