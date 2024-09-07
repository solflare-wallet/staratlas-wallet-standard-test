import './app.css';

import {
  ColorModeProvider,
  ColorModeScript,
  createLocalStorageManager,
} from '@kobalte/core';
import { getWallets } from '@wallet-standard/app';
import { Component, For, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';
import ColorModeToggle from '~/components/ColorModeToggle';
import { ConnectionProvider } from '~/components/connection';
import { Toaster } from '~/components/ui/sonner';
import { WalletProxy, createWalletProxy } from '~/types';
import WalletCard from '~/WalletCard';

export default (() => {
  const storageManager = createLocalStorageManager('vite-ui-theme');
  const walletsGetter = getWallets();
  const [walletsList, setWalletsList] = createStore<WalletProxy[]>([]);
  setWalletsList(
    walletsGetter
      .get()
      .map((wallet, index) => createWalletProxy(wallet, index, setWalletsList)),
  );
  // This is an event handler
  // eslint-disable-next-line solid/reactivity
  const onWalletRegister = walletsGetter.on('register', (...wallets) => {
    for (const wallet of wallets) {
      setWalletsList(
        walletsList.length,
        createWalletProxy(wallet, walletsList.length, setWalletsList),
      );
    }
    toast.info(`Wallet${wallets.length === 1 ? '' : 's'} registered`, {
      description: wallets.map((wallet) => wallet.name),
    });
  });
  const onWalletUnregister = walletsGetter.on('unregister', (...wallets) => {
    let offset = 0;
    setWalletsList((w) =>
      w.filter((wallet) => {
        wallet.index -= offset;
        const remove = !!wallets.find((w) => w.name === wallet.name);
        if (remove) {
          wallet.cleanup();
          offset += 1;
          return false;
        } else {
          return true;
        }
      }),
    );
    toast.info(`Wallet${wallets.length === 1 ? '' : 's'} unregistered`, {
      description: wallets.map((wallet) => wallet.name),
    });
  });
  onCleanup(() => {
    onWalletRegister();
    onWalletUnregister();
    for (const wallet of walletsList) {
      wallet.cleanup();
    }
  });

  return (
    <ConnectionProvider
      endpoint={
        'https://rpc.ironforge.network/mainnet?apiKey=01J74XTM05TVY7WTMJXZ3Z348P'
      }
    >
      <Toaster closeButton={true} />
      <ColorModeScript storageType={storageManager.type} />
      <ColorModeProvider storageManager={storageManager}>
        <div class="border-b">
          <div class="container flex h-16 items-center justify-between">
            <nav class="flex items-center space-x-4">
              <ColorModeToggle />
            </nav>
            <div>
              <a
                onClick={() => {}}
                class="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Wallet
              </a>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="grid items-start justify-between gap-2 pt-4 lg:grid-cols-2 xl:grid-cols-3">
            <For each={walletsList}>
              {(wallet) => <WalletCard wallet={wallet} />}
            </For>
          </div>
        </div>
      </ColorModeProvider>
    </ConnectionProvider>
  );
}) satisfies Component;
