import { Wallet } from '@wallet-standard/base';
import { WalletProxy } from '~/types';

import {
  SolanaSignAndSendTransaction,
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessage,
  SolanaSignMessageFeature,
  SolanaSignTransaction,
  SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import {
  StandardConnect,
  StandardConnectFeature,
  StandardDisconnect,
  StandardDisconnectFeature,
  StandardEvents,
  StandardEventsFeature,
} from '@wallet-standard/features';
import { Component, ErrorBoundary, For, lazy, Match, Switch } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

const EventsFeature = lazy(() => import('./EventsFeature'));
const SignAndSendTransactionFeature = lazy(
  () => import('./SignAndSendTransactionFeature'),
);
const SignMessageFeature = lazy(() => import('./SignMessageFeature'));
const SignTransactionFeature = lazy(() => import('./SignTransactionFeature'));
const ConnectFeature = lazy(() => import('./ConnectFeature'));
const DisconnectFeature = lazy(() => import('./DisconnectFeature'));

export type FeatureProps<F extends Wallet['features']> = {
  wallet: WalletProxy<F>;
};

export default ((props) => {
  return (
    <Popover>
      <PopoverTrigger
        class="h-fit w-fit p-0"
        as={Button<'button'>}
        variant={'link'}
        onClick={() => {
          console.log(props.wallet.features[props.feature]);
        }}
      >
        {props.feature}
      </PopoverTrigger>
      <PopoverContent class={'w-fit'}>
        <ErrorBoundary fallback={'Error rendering feature.'}>
          <Switch
            fallback={
              <>
                <strong>Feature not implemented</strong>
                <hr class={'my-1'} />
                <div class="grid grid-cols-3">
                  Fields:
                  <div class="col-span-2">
                    <For
                      each={Object.keys(
                        props.wallet.features[props.feature] as object,
                      )}
                    >
                      {(key) => <div>{key}</div>}
                    </For>
                  </div>
                </div>
              </>
            }
          >
            <Match when={props.feature === StandardConnect}>
              <ConnectFeature
                wallet={props.wallet as WalletProxy<StandardConnectFeature>}
              />
            </Match>
            <Match when={props.feature === StandardDisconnect}>
              <DisconnectFeature
                wallet={props.wallet as WalletProxy<StandardDisconnectFeature>}
              />
            </Match>
            <Match when={props.feature === StandardEvents}>
              <EventsFeature
                wallet={props.wallet as WalletProxy<StandardEventsFeature>}
              />
            </Match>
            <Match when={props.feature === SolanaSignAndSendTransaction}>
              <SignAndSendTransactionFeature
                wallet={
                  props.wallet as WalletProxy<SolanaSignAndSendTransactionFeature>
                }
              />
            </Match>
            <Match when={props.feature === SolanaSignTransaction}>
              <SignTransactionFeature
                wallet={
                  props.wallet as WalletProxy<SolanaSignTransactionFeature>
                }
              />
            </Match>
            <Match when={props.feature === SolanaSignMessage}>
              <SignMessageFeature
                wallet={props.wallet as WalletProxy<SolanaSignMessageFeature>}
              />
            </Match>
          </Switch>
        </ErrorBoundary>
      </PopoverContent>
    </Popover>
  );
}) satisfies Component<{
  wallet: WalletProxy;
  feature: `${string}:${string}`;
}>;
