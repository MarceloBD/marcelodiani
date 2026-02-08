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
  const currentEndpointReference = useRef(endpoint);

  // Track the latest endpoint so the fetch callback always reads the current value
  currentEndpointReference.current = endpoint;

  const fetchData = useCallback(async (fetchEndpoint: string) => {
    abortControllerReference.current?.abort();
    const controller = new AbortController();
    abortControllerReference.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchEndpoint, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      const result = transform ? transform(json) : (json as T);

      // Only apply the result if the endpoint hasn't changed while we were fetching
      if (currentEndpointReference.current === fetchEndpoint) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch data";
      if (currentEndpointReference.current === fetchEndpoint) {
        setError(message);
      }
    } finally {
      if (currentEndpointReference.current === fetchEndpoint) {
        setIsLoading(false);
      }
    }
  }, [transform]);

  // Single effect that handles endpoint changes, initial fetch, and polling
  useEffect(() => {
    if (!enabled) return;

    // Reset state when endpoint changes and start a new fetch
    setData(null);
    setError(null);
    setLastUpdated(null);

    fetchData(endpoint);

    if (pollingIntervalMs > 0) {
      const interval = setInterval(() => fetchData(endpoint), pollingIntervalMs);
      return () => {
        clearInterval(interval);
        abortControllerReference.current?.abort();
      };
    }

    return () => {
      abortControllerReference.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, pollingIntervalMs, enabled]);

  const refetch = useCallback(() => fetchData(currentEndpointReference.current), [fetchData]);

  return { data, isLoading, error, lastUpdated, refetch };
}
