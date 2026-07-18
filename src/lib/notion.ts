import { env } from '../config/env';

// Thin wrapper around the Notion HTTP API. The bot only ever reads from a
// single Notion database (the credential vault backing the `a`/`s` commands),
// so a full SDK dependency is unnecessary — Node's global `fetch` plus the
// shared auth headers is enough. Repositories build the request paths/bodies
// and map the raw responses into domain types.
const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export async function notionRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Notion API request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}
