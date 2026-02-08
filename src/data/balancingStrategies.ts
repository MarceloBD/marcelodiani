export type BalancingStrategyType = "roundRobin" | "leastConnections";

export interface BalancingStrategyInfo {
  name: string;
  description: string;
  complexity: string;
  stateRequired: boolean;
  goodFor: string[];
  badFor: string[];
}

export const BALANCING_STRATEGIES: Record<BalancingStrategyType, BalancingStrategyInfo> = {
  roundRobin: {
    name: "Round Robin",
    description:
      "Distributes requests sequentially across all healthy instances in a circular order. Each server receives one request before the cycle repeats. It is the simplest and most widely used load balancing strategy — no state tracking is needed, making it extremely fast and predictable.",
    complexity: "O(1)",
    stateRequired: false,
    goodFor: [
      "Stateless services where all instances have equal capacity",
      "Simple deployments with homogeneous hardware",
      "High-throughput scenarios — near-zero overhead per request",
    ],
    badFor: [
      "Services with uneven request durations — slow requests pile up on one server",
      "Heterogeneous clusters where instances have different capacities",
      "Stateful workloads that need session affinity (sticky sessions)",
    ],
  },
  leastConnections: {
    name: "Least Connections",
    description:
      "Routes each new request to the instance with the fewest active connections. This adapts in real time to workload imbalances — if one server is handling slow requests, it naturally receives fewer new ones. Widely used in production load balancers like AWS ALB and NGINX.",
    complexity: "O(n) or O(log n) with heap",
    stateRequired: true,
    goodFor: [
      "Services with variable request durations (API calls, DB queries, uploads)",
      "Mixed workloads where some requests are fast and others are slow",
      "Clusters with heterogeneous instances or temporary capacity differences",
    ],
    badFor: [
      "Purely stateless, uniform-latency services — Round Robin is simpler and equally effective",
      "Very high request rates where tracking connections adds measurable overhead",
      "Cold-start scenarios — new instances with 0 connections get flooded immediately",
    ],
  },
};
