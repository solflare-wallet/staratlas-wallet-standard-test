import { Component, ErrorBoundary, For, Show } from 'solid-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import WalletFeature from '~/features';
import { WalletProxy } from '~/types';
import { formatKey } from '~/util';

export default ((props) => {
  return (
    <ErrorBoundary
      fallback={`Failed to render WalletCard for ${props.wallet.name}`}
    >
      <Card class={'w-[400px]'}>
        <CardHeader>
          <CardTitle class={'flex'}>
            <img
              src={props.wallet.icon}
              alt={props.wallet.name}
              class="mr-1 h-5 w-5"
            />
            {props.wallet.name}
          </CardTitle>
          <CardDescription>Detected Wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <span class="text-xl font-extrabold">Fields</span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>{props.wallet.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Chains</TableCell>
                <TableCell class="grid grid-cols-1">
                  <For each={props.wallet.chains}>
                    {(chain) => <div>{chain}</div>}
                  </For>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Features</TableCell>
                <TableCell class="grid grid-cols-1">
                  <For
                    each={
                      Object.keys(
                        props.wallet.features,
                      ) as `${string}:${string}`[]
                    }
                  >
                    {(feature) => (
                      <WalletFeature wallet={props.wallet} feature={feature} />
                    )}
                  </For>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Accounts({props.wallet.accounts.length})</TableCell>
                <TableCell class="grid grid-cols-1">
                  <div class="grid grid-cols-1">
                    <For each={props.wallet.accounts} fallback={'No accounts'}>
                      {(account, index) => (
                        <>
                          <div class={'grid grid-cols-1'}>
                            <div>
                              <strong>Address</strong>
                              <br />
                              {formatKey(account.address)}
                            </div>
                            <br />
                            <div>
                              <strong>Chains</strong>
                              <br />
                              {account.chains.join(', ')}
                            </div>
                            <br />
                            <div>
                              <strong>Features</strong>
                              <br />
                              {account.features.join(', ')}
                            </div>
                            <br />
                            <div>
                              <strong>Label</strong>
                              <br />
                              {account.label ?? 'No Label'}
                            </div>
                            <br />
                            <div>
                              <strong>Icon</strong>
                              <br />
                              <Show when={account.icon} fallback={'No Icon'}>
                                {(icon) => (
                                  <img
                                    src={icon()}
                                    alt={props.wallet.name}
                                    class="mr-1 h-5 w-5"
                                  />
                                )}
                              </Show>
                            </div>
                          </div>
                          <Show
                            when={index() !== props.wallet.accounts.length - 1}
                          >
                            <Separator class={'my-2'} />
                          </Show>
                        </>
                      )}
                    </For>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}) satisfies Component<{
  wallet: WalletProxy;
}>;
