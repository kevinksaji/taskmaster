import { env } from '../config/env';
import { notionRequest } from '../lib/notion';
import { VaultEntry, VaultField, VaultKind } from '../types/vault';

// The Notion database column that separates accounts from subscriptions, and
// the exact option names it stores for each kind.
const SELECT_PROPERTY = 'Select';
const SELECT_VALUE: Record<VaultKind, string> = {
  account: 'Account',
  subscription: 'Subscription',
};

// Notion column that holds the entry's display name (the row's title).
const NAME_PROPERTY = 'Name';

// Credential columns surfaced in the detail view, in the order they should be
// shown. Anything empty for a given row is dropped when the entry is mapped.
const DETAIL_PROPERTIES = [
  'Username',
  'Email',
  'Password',
  'Phone Number',
  'Account Number',
  'Card',
  'Date of Expiry',
];

// Minimal shape of the pieces of a Notion page we actually read. Notion returns
// a large, loosely-typed payload; we narrow it here so the rest of the app only
// ever sees clean `VaultEntry` values.
type NotionProperty = {
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  select?: { name: string } | null;
  phone_number?: string | null;
  date?: { start: string } | null;
};

type NotionPage = {
  id: string;
  archived?: boolean;
  properties: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
};

// Flatten any supported Notion property into a trimmed plain string. Unknown or
// empty property types collapse to an empty string so callers can filter them.
function readProperty(property: NotionProperty | undefined): string {
  if (!property) {
    return '';
  }

  switch (property.type) {
    case 'title':
      return (property.title ?? []).map((part) => part.plain_text).join('').trim();
    case 'rich_text':
      return (property.rich_text ?? []).map((part) => part.plain_text).join('').trim();
    case 'select':
      return property.select?.name ?? '';
    case 'phone_number':
      return property.phone_number ?? '';
    case 'date':
      return property.date?.start ?? '';
    default:
      return '';
  }
}

function mapPage(page: NotionPage): VaultEntry {
  const properties = page.properties ?? {};
  const name = readProperty(properties[NAME_PROPERTY]) || 'Untitled';
  const kind: VaultKind = readProperty(properties[SELECT_PROPERTY]) === SELECT_VALUE.subscription
    ? 'subscription'
    : 'account';

  const fields: VaultField[] = DETAIL_PROPERTIES
    .map((label) => ({ label, value: readProperty(properties[label]) }))
    .filter((field) => field.value.length > 0);

  return { id: page.id, name, kind, fields };
}

export const vaultRepository = {
  // Fetch every entry of a given kind, following Notion's pagination cursor so
  // vaults larger than one page still return in full.
  async listByKind(kind: VaultKind): Promise<VaultEntry[]> {
    const pages: NotionPage[] = [];
    let cursor: string | undefined;

    do {
      const response = await notionRequest<NotionQueryResponse>(
        `/databases/${env.NOTION_DATABASE_ID}/query`,
        {
          method: 'POST',
          body: JSON.stringify({
            filter: { property: SELECT_PROPERTY, select: { equals: SELECT_VALUE[kind] } },
            sorts: [{ property: NAME_PROPERTY, direction: 'ascending' }],
            page_size: 100,
            ...(cursor ? { start_cursor: cursor } : {}),
          }),
        },
      );

      pages.push(...response.results);
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    return pages.map(mapPage);
  },

  // Look up a single entry by its Notion page id. Returns null for missing or
  // archived pages so callers can surface a friendly "not found" message.
  async findById(pageId: string): Promise<VaultEntry | null> {
    try {
      const page = await notionRequest<NotionPage>(`/pages/${pageId}`);
      if (page.archived) {
        return null;
      }

      return mapPage(page);
    } catch {
      return null;
    }
  },
};
