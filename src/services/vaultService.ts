import { vaultRepository } from '../repositories/vaultRepository';
import { VaultKind } from '../types/vault';
import { UserFacingError } from '../utils/errors';

const NOT_FOUND_MESSAGE: Record<VaultKind, string> = {
  account: 'That account could not be found. It may have been removed from Notion.',
  subscription: 'That subscription could not be found. It may have been removed from Notion.',
};

export const vaultService = {
  listAccounts() {
    return vaultRepository.listByKind('account');
  },

  listSubscriptions() {
    return vaultRepository.listByKind('subscription');
  },

  // Resolve a single entry and assert it matches the expected kind, so an
  // account button can never render a subscription (or vice versa) if a stale
  // callback carries a mismatched id.
  async getEntryOrThrow(kind: VaultKind, id: string) {
    const entry = await vaultRepository.findById(id);
    if (!entry || entry.kind !== kind) {
      throw new UserFacingError(NOT_FOUND_MESSAGE[kind]);
    }

    return entry;
  },
};
