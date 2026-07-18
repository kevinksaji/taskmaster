import { VaultEntry, VaultKind } from '../types/vault';
import {
  showAccountsData,
  showSubscriptionsData,
  viewAccountData,
  viewSubscriptionData,
} from '../utils/callback-data';
import { inlineKeyboard, toCallbackButton } from './common';
import { buildBackAndCancelRow, buildCancelRow } from './navigation';

// The `a` and `s` flows share one keyboard shape, parametrized by kind so each
// button and the detail-view Back target route to the correct browser.
function viewData(kind: VaultKind, id: string) {
  return kind === 'account' ? viewAccountData(id) : viewSubscriptionData(id);
}

function browserData(kind: VaultKind) {
  return kind === 'account' ? showAccountsData() : showSubscriptionsData();
}

// One button per entry that opens its detail view, followed by a Cancel row.
export function buildVaultListKeyboard(entries: VaultEntry[], kind: VaultKind) {
  return inlineKeyboard([
    ...entries.map((entry) => [toCallbackButton(entry.name, viewData(kind, entry.id))]),
    buildCancelRow(),
  ]);
}

// Detail view: let the user step back to the list or cancel out entirely.
export function buildVaultDetailKeyboard(kind: VaultKind) {
  return inlineKeyboard([
    buildBackAndCancelRow(browserData(kind)),
  ]);
}
