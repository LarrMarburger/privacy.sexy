import { fetchWithTimeout } from './FetchWithTimeout';

export function fetchFollow(
  url: string,
  timeoutInMs: number,
  fetchOptions: RequestInit,
  followOptions: IFollowOptions | undefined,
): Promise<Response> {
  const defaultedFollowOptions = {
    ...DefaultFollowOptions,
    ...followOptions,
  };
  if (followRedirects(defaultedFollowOptions)) {
    return fetchWithTimeout(url, timeoutInMs, fetchOptions);
  }
  fetchOptions = { ...fetchOptions, redirect: 'manual' /* handled manually */ };
  const cookies = new CookieStorage(defaultedFollowOptions.enableCookies);
  return followRecursivelyWithCookies(
    url,
    timeoutInMs,
    fetchOptions,
    defaultedFollowOptions.maximumRedirectFollowDepth,
    cookies,
  );
}

export interface IFollowOptions {
  followRedirects?: boolean;
  maximumRedirectFollowDepth?: number;
  enableCookies?: boolean;
}

export const DefaultFollowOptions: Required<IFollowOptions> = {
  followRedirects: true,
  maximumRedirectFollowDepth: 20,
  enableCookies: true,
};

async function followRecursivelyWithCookies(
  url: string,
  timeoutInMs: number,
  options: RequestInit,
  followDepth: number,
  cookies: CookieStorage,
): Promise<Response> {
  options = updateCookieHeader(cookies, options);
  const response = await fetchWithTimeout(
    url,
    timeoutInMs,
    options,
  );
  if (!isRedirect(response.status)) {
    return response;
  }
  const newFollowDepth = followDepth - 1;
  if (newFollowDepth < 0) {
    throw new Error(`[max-redirect] maximum redirect reached at: ${url}`);
  }
  const nextUrl = response.headers.get('location');
  if (!nextUrl) {
    return response;
  }
  const cookieHeader = response.headers.get('set-cookie');
  if (cookieHeader) {
    cookies.addHeader(cookieHeader);
  }
  return followRecursivelyWithCookies(nextUrl, timeoutInMs, options, newFollowDepth, cookies);
}

function isRedirect(code: number): boolean {
  return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
}

class CookieStorage {
  public cookies = new Array<string>();

  constructor(private readonly enabled: boolean) {
  }

  public hasAny() {
    return this.enabled && this.cookies.length > 0;
  }

  public addHeader(header: string) {
    if (!this.enabled || !header) {
      return;
    }
    this.cookies.push(header);
  }

  public getHeader() {
    return this.cookies.join(' ; ');
  }
}

function followRedirects(options: IFollowOptions) {
  if (!options.followRedirects) {
    return false;
  }
  if (options.maximumRedirectFollowDepth === 0) {
    return false;
  }
  return true;
}

function updateCookieHeader(
  cookies: CookieStorage,
  options: RequestInit,
): RequestInit {
  if (!cookies.hasAny()) {
    return options;
  }
  const newOptions = { ...options, headers: { ...options.headers, cookie: cookies.getHeader() } };
  return newOptions;
}
