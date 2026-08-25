import { LeetCodeGraphQLResponse } from "./types";

interface GraphQLRequest<TVariables> {
  query: string;
  variables?: TVariables;
}

interface GraphQLClientOptions {
  timeoutMs?: number;
  retries?: number;
  cache?: RequestCache;
  revalidateSeconds?: number;
}

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 1;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function leetCodeGraphQL<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  request: GraphQLRequest<TVariables>,
  options: GraphQLClientOptions = {}
): Promise<LeetCodeGraphQLResponse<TData>> {
  const endpoint = process.env.LEETCODE_GRAPHQL_ENDPOINT || "https://leetcode.com/graphql";
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const cache = options.cache ?? "no-store";

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "PSGMX/1.0",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
        cache,
        next: options.revalidateSeconds ? { revalidate: options.revalidateSeconds } : undefined,
      });

      const text = await res.text();
      let parsed: LeetCodeGraphQLResponse<TData>;

      try {
        parsed = JSON.parse(text) as LeetCodeGraphQLResponse<TData>;
      } catch {
        throw new Error(`LeetCode returned non-JSON response (status ${res.status})`);
      }

      if (!res.ok) {
        const errorMessage = parsed.errors?.[0]?.message || `LeetCode request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      return parsed;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("Unknown LeetCode client error");
      lastError = normalizedError;

      const canRetry = attempt < retries;
      if (canRetry) {
        await sleep(250 * (attempt + 1));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("LeetCode request failed");
}
