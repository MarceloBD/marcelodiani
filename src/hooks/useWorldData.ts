"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UseWorldDataOptions<T> {
  /** API endpoint path (e.g. "/api/world-data/weather?city=london") */
  endpoint: string;
  /** Polling interval in milliseconds (0 = no polling) */
  pollingIntervalMs?: number;
  /** Whether to fetch immediately on mount */
  enabled?: boolean;
  /** Transform the raw JSON response */
  transform?: (raw: Record<string, unknown>) => T;
}

interface UseWorldDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useWorldData<T>({
  endpoint,
  pollingIntervalMs = 0,
  enabled = true,
  transform,
}: UseWorldDataOptions<T>): UseWorldDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);
  const previousEndpointReference = useRef(endpoint);

  // Reset state when endpoint changes (e.g. user switches league, city, symbol)
  useEffect(() => {
    if (previousEndpointReference.current !== endpoint) {
      setData(null);
      setError(null);
      setLastUpdated(null);
      previousEndpointReference.current = endpoint;
    }
  }, [endpoint]);

  const fetchData = useCallback(async () => {
    abortControllerReference.current?.abort();
    const controller = new AbortController();
    abortControllerReference.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      const result = transform ? transform(json) : (json as T);

      setData(result);
      setLastUpdated(new Date());
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, transform]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    if (pollingIntervalMs > 0) {
      const interval = setInterval(fetchData, pollingIntervalMs);
      return () => {
        clearInterval(interval);
        abortControllerReference.current?.abort();
      };
    }

    return () => {
      abortControllerReference.current?.abort();
    };
  }, [fetchData, pollingIntervalMs, enabled]);

  return { data, isLoading, error, lastUpdated, refetch: fetchData };
}
