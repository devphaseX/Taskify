export const fetcher = <T>(url: string, init?: RequestInit) =>
  fetch(url, init).then<T>((res) => res.json());
