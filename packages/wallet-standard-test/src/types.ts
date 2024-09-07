import {
  IdentifierString,
  Wallet,
  WalletAccount,
  WalletVersion,
} from '@wallet-standard/base';
import {
  StandardEvents,
  StandardEventsFeature,
} from '@wallet-standard/features';
import { SetStoreFunction, produce } from 'solid-js/store';

export type WalletProxy<
  F extends Wallet['features'] = Record<IdentifierString, unknown>,
> = {
  index: number;
  events: string[] | null;
  readonly version: WalletVersion;
  readonly name: string;
  readonly icon: string;
  chains: IdentifierString[];
  features: F;
  accounts: WalletAccount[];
  cleanup(): void;
};

export function createWalletProxy(
  wallet: Wallet,
  index: number,
  setWallet: SetStoreFunction<WalletProxy[]>,
): WalletProxy {
  if (StandardEvents in wallet.features) {
    const events = wallet.features[
      StandardEvents
    ] as StandardEventsFeature[typeof StandardEvents];
    const out: WalletProxy & { events: NonNullable<WalletProxy['events']> } = {
      index,
      events: [],
      version: wallet.version,
      name: wallet.name,
      icon: wallet.icon,
      chains: [...wallet.chains],
      features: wallet.features,
      accounts: [...wallet.accounts],
      cleanup() {},
    };
    out.cleanup = events.on('change', (event) => {
      console.log(`event from ${wallet.name}:`, event);
      setWallet(
        out.index,
        produce((w) => {
          w.events?.push(JSON.stringify(event));
          if (event.features) {
            w.features = event.features;
          }
          if (event.accounts) {
            w.accounts = [...event.accounts];
          }
          if (event.chains) {
            w.chains = [...event.chains];
          }
        }),
      );
    });
    return out;
  } else {
    return {
      index,
      events: null,
      version: wallet.version,
      name: wallet.name,
      icon: wallet.icon,
      chains: [...wallet.chains],
      features: wallet.features,
      accounts: [...wallet.accounts],
      cleanup() {},
    };
  }
}
