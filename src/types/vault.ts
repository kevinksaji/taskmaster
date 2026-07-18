// The `a` (accounts) and `s` (subscriptions) commands both read from a single
// Notion database whose rows are tagged with a `Select` property. They share an
// identical schema, so a single "vault" domain type serves both and the `kind`
// discriminator keeps the two browsing flows separate.
export type VaultKind = 'account' | 'subscription';

// A single labelled credential detail (e.g. { label: 'Email', value: '...' }).
// Only populated fields are surfaced, so the detail view stays uncluttered.
export type VaultField = {
  label: string;
  value: string;
};

export type VaultEntry = {
  id: string;
  name: string;
  kind: VaultKind;
  fields: VaultField[];
};
