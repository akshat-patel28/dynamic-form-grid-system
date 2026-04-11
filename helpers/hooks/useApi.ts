import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError, type RawAxiosRequestHeaders } from "axios";

/**
 * HTTP verbs supported by {@link useApi}. Passed through to axios (normalized to lowercase).
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Configuration for a single axios request managed by {@link useApi}.
 *
 * @template TPayload - Request body type when using POST, PUT, or PATCH with a payload.
 *   Use `undefined` (default) for GET/DELETE or when no body is sent.
 */
export type UseApiOptions<TPayload = undefined> = {
  /**
   * Full URL or path passed to axios as `url` (e.g. `"/api/users"` or `"https://api.example.com/items"`).
   * Relative paths resolve against the current origin in the browser.
   */
  endpoint: string;
  /** HTTP method for the request. */
  method: HttpMethod;
  /**
   * Optional JSON body. Only sent for `POST`, `PUT`, and `PATCH` when defined.
   * Serialized by axios; `Content-Type: application/json` is set unless you override it in `headers`.
   */
  payload?: TPayload;
  /**
   * Extra request headers (`HeadersInit`: plain object, `[name, value][]`, or `Headers`).
   * Merged with any default `Content-Type` for JSON bodies.
   */
  headers?: HeadersInit;
  /**
   * When `false`, the hook does not run a request, clears the in-flight effect, and sets `loading` to `false`.
   * Use this to wait for required inputs (e.g. an id) before calling the API. Defaults to `true`.
   */
  enabled?: boolean;
};

/**
 * Return value of {@link useApi}.
 *
 * @template TData - Successful response body type after axios parses JSON (or your declared shape).
 */
export type UseApiResult<TData> = {
  /**
   * Last successful response `data` from axios, or `null` if the body was empty/undefined/`""`,
   * or after a failed request (error path clears `data`).
   */
  data: TData | null;
  /** `true` while a request is in flight (initial fetch, dependency-driven refetch, or `refetch`). */
  loading: boolean;
  /**
   * Set when the request fails (non-2xx, network error, etc.). Derived from `AxiosError` when applicable.
   * Not set for intentional cancellation (`AbortController` / unmount); those are ignored.
   */
  error: Error | null;
  /**
   * Runs the same request again manually. Respects `enabled` (no-op if `enabled` is `false`).
   * Does not change dependency behavior; use this after mutations or to retry after an error.
   */
  refetch: () => Promise<void>;
};

const BODY_METHODS: ReadonlySet<HttpMethod> = new Set(["POST", "PUT", "PATCH"]);

function shouldAttachJsonBody<TPayload>(
  method: HttpMethod,
  payload: TPayload | undefined,
): payload is TPayload {
  return BODY_METHODS.has(method) && payload !== undefined;
}

function serializeForDeps(value: unknown): string {
  if (value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function headersDependencyKey(headers: HeadersInit | undefined): string {
  if (headers === undefined) return "";
  if (headers instanceof Headers) {
    return [...headers.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
  }
  if (Array.isArray(headers)) {
    return JSON.stringify(headers);
  }
  return serializeForDeps(headers);
}

function toAxiosHeaders(
  h: HeadersInit | undefined,
): RawAxiosRequestHeaders | undefined {
  if (h === undefined) return undefined;
  if (h instanceof Headers) {
    return Object.fromEntries(h.entries()) as RawAxiosRequestHeaders;
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h) as RawAxiosRequestHeaders;
  }
  return h as RawAxiosRequestHeaders;
}

function isCanceled(e: unknown): boolean {
  return axios.isAxiosError(e) && e.code === AxiosError.ERR_CANCELED;
}

function toRequestError(e: unknown): Error {
  if (axios.isAxiosError(e)) {
    const ax = e as AxiosError<unknown>;
    if (ax.code === AxiosError.ERR_CANCELED) {
      return new Error("Request canceled");
    }
    const data = ax.response?.data;
    if (typeof data === "string" && data.trim()) {
      return new Error(data.trim());
    }
    if (data && typeof data === "object") {
      const msg = (data as Record<string, unknown>).message;
      if (typeof msg === "string") return new Error(msg);
    }
    const status = ax.response?.status;
    const text = ax.response?.statusText;
    if (status != null) {
      return new Error(
        `${status}${text ? ` ${text}` : ""}`.trim() || ax.message,
      );
    }
    return new Error(ax.message);
  }
  return e instanceof Error ? e : new Error(String(e));
}

/**
 * React hook that performs one axios HTTP request and keeps `data`, `loading`, and `error` in sync.
 *
 * **When it runs:** On mount and whenever `options.endpoint`, `options.method`, `options.enabled`,
 * or a serialized snapshot of `options.payload` / `options.headers` changes, the previous request is
 * aborted and a new one starts. Payload/header identity uses JSON serialization (for plain objects)
 * or a stable string for `Headers` / header tuples so inline object literals with the same values
 * do not spuriously retrigger.
 *
 * **Request behavior:** Uses axios `request()` (see axios docs) with
 * `signal` from an internal `AbortController` so cleanup on unmount or dependency change cancels
 * the call. `POST` / `PUT` / `PATCH` send `payload` as the JSON body when `payload` is defined;
 * `GET` and `DELETE` do not send a body from `payload`.
 *
 * **Errors:** Failed responses and network errors surface as `error` (see {@link UseApiResult}).
 * Canceled requests (`ERR_CANCELED`) do not set `error`.
 *
 * @template TData - Type of the successful response body (axios `response.data`).
 * @template TPayload - Type of `options.payload` when sending a JSON body.
 *
 * @param options - {@link UseApiOptions} for URL, method, optional body, headers, and `enabled` gate.
 *
 * @returns {@link UseApiResult} with `data`, `loading`, `error`, and `refetch`.
 *
 * @example Loading a resource (GET)
 * ```tsx
 * type User = { id: string; name: string };
 *
 * function Profile({ userId }: { userId: string }) {
 *   const { data, loading, error, refetch } = useApi<User>({
 *     endpoint: `/api/users/${userId}`,
 *     method: "GET",
 *     enabled: Boolean(userId),
 *   });
 *
 *   if (loading) return <p>Loading…</p>;
 *   if (error) return <p>{error.message}</p>;
 *   if (!data) return null;
 *   return <p>{data.name}</p>;
 * }
 * ```
 *
 * @example Creating a resource (POST) with typed payload
 * ```tsx
 * type User = { id: string; name: string };
 * type CreateUser = { name: string; email: string };
 *
 * function useCreateUser() {
 *   return useApi<User, CreateUser>({
 *     endpoint: "/api/users",
 *     method: "POST",
 *     payload: { name: "Ada", email: "ada@example.com" },
 *   });
 * }
 * ```
 */
export function useApi<TData, TPayload = undefined>(
  options: UseApiOptions<TPayload>,
): UseApiResult<TData> {
  const { endpoint, method, payload, headers, enabled = true } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(() => enabled);
  const [error, setError] = useState<Error | null>(null);

  const payloadRef = useRef(payload);
  const headersRef = useRef(headers);
  payloadRef.current = payload;
  headersRef.current = headers;

  const payloadKey = useMemo(() => serializeForDeps(payload), [payload]);
  const headersKey = useMemo(() => headersDependencyKey(headers), [headers]);

  const execute = useCallback(
    async (signal: AbortSignal) => {
      void payloadKey;
      void headersKey;
      const currentPayload = payloadRef.current;
      const currentHeaders = headersRef.current;

      const baseHeaders = toAxiosHeaders(currentHeaders) ?? {};
      const mergedHeaders: RawAxiosRequestHeaders = { ...baseHeaders };
      if (
        shouldAttachJsonBody(method, currentPayload) &&
        mergedHeaders["Content-Type"] === undefined &&
        mergedHeaders["content-type"] === undefined
      ) {
        mergedHeaders["Content-Type"] = "application/json";
      }

      const res = await axios.request<TData>({
        url: endpoint,
        method: method.toLowerCase() as Lowercase<HttpMethod>,
        data: shouldAttachJsonBody(method, currentPayload)
          ? currentPayload
          : undefined,
        headers: mergedHeaders,
        signal,
      });

      const body = res.data;
      setData(
        body === undefined || body === "" ? null : (body as TData | null),
      );
    },
    [endpoint, method, payloadKey, headersKey],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void execute(controller.signal)
      .catch((e: unknown) => {
        if (controller.signal.aborted || isCanceled(e)) return;
        setError(toRequestError(e));
        setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, execute]);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      await execute(controller.signal);
    } catch (e: unknown) {
      if (isCanceled(e)) return;
      setError(toRequestError(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, execute]);

  return { data, loading, error, refetch };
}
