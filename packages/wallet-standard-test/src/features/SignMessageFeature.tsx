import {
  SolanaSignMessage,
  SolanaSignMessageFeature,
} from '@solana/wallet-standard-features';
import { Component, createMemo, createSignal } from 'solid-js';
import { toast } from 'solid-sonner';
import SelectWalletComboBox, {
  WalletAccountWrapper,
} from '~/components/SelectWalletComboBox';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from '~/components/ui/text-field';
import { FeatureProps } from '~/features/index';
import { formatKey, stringifyError, verifySignature } from '~/util';

export default ((props) => {
  const feature = () => props.wallet.features[SolanaSignMessage];
  const accountsWithSignMessage = createMemo(() =>
    props.wallet.accounts.filter((account) =>
      account.features.includes(SolanaSignMessage),
    ),
  );
  const onSignMessage = (addresses: string[], message: string) => {
    const encoder = new TextEncoder();
    const accounts = accountsWithSignMessage().filter(
      (account) => !!addresses.find((a) => a === account.address),
    );
    if (accounts.length !== addresses.length) {
      throw new Error(
        `Expected ${addresses.length} accounts, got ${accounts.length}. Bug in tester`,
      );
    }
    const messages = accounts.map((account) =>
      encoder.encode(
        message === '' ? `Message for ${account.address}` : message,
      ),
    );
    if (accounts.length === 0) {
      throw new Error('No accounts selected');
    }
    toast.promise(
      feature()
        .signMessage(
          ...accounts.map((account) => ({
            account,
            message: new TextEncoder().encode(
              message === '' ? `Message for ${account.address}` : message,
            ),
          })),
        )
        .then((sigs) => {
          if (sigs.length !== accounts.length) {
            throw new Error(
              `Expected ${accounts.length} signatures, got ${sigs.length}`,
            );
          }
          sigs.forEach((r, index) => {
            const account = accounts[index];
            const message = messages[index];
            verifySignature(
              r.signedMessage,
              r.signature,
              account.publicKey,
              account.label ?? formatKey(account.address),
              message,
            );
          });
        }),
      {
        loading: `Signing message${accounts.length === 1 ? '' : 's'}...`,
        success: `Message${accounts.length === 1 ? '' : 's'} signed successfully`,
        error: (e) => {
          console.error('Failed to sign message: ', e);
          return `Failed to sign message: ${stringifyError(e)}`;
        },
      },
    );
  };

  const [selectedAccounts, setSelectedAccounts] = createSignal<
    WalletAccountWrapper[]
  >([]);
  const [message, setMessage] = createSignal<string>('');
  const disableSign = () => selectedAccounts().length === 0;

  return (
    <div class="grid grid-cols-1 items-center justify-between gap-1">
      <div>{`Version: ${feature().version}`}</div>
      <Dialog>
        <DialogTrigger
          as={Button<'button'>}
          disabled={accountsWithSignMessage().length === 0}
        >
          Sign Message
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Message</DialogTitle>
            <DialogDescription>
              Sign a set of bytes. All listed accounts should successfully sign.
            </DialogDescription>
          </DialogHeader>

          <SelectWalletComboBox
            selectedAccounts={[selectedAccounts, setSelectedAccounts]}
            accounts={accountsWithSignMessage()}
            fallbackText={`No accounts support ${SolanaSignMessage}`}
          />

          <TextField class="grid grid-cols-4 items-center gap-4">
            <TextFieldLabel>Message</TextFieldLabel>
            <TextFieldInput
              class={'col-span-3'}
              value={message() ?? ''}
              type="text"
              placeholder={'Message for <account>'}
              onInput={(e) =>
                setMessage((e.target as HTMLInputElement).value ?? '')
              }
            />
          </TextField>

          <DialogFooter>
            <Button
              onClick={() =>
                onSignMessage(
                  selectedAccounts().map((a) => a.account.address),
                  message(),
                )
              }
              disabled={disableSign()}
            >
              Sign Message{selectedAccounts().length === 1 ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}) satisfies Component<FeatureProps<SolanaSignMessageFeature>>;
