import {
  SolanaSignTransaction,
  SolanaSignTransactionFeature,
  SolanaSignTransactionVersion,
} from '@solana/wallet-standard-features';
import {
  Blockhash,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Component, createMemo, createSignal } from 'solid-js';
import { toast } from 'solid-sonner';
import { useConnection } from '~/components/connection';
import SelectWalletComboBox, {
  WalletAccountWrapper,
} from '~/components/SelectWalletComboBox';
import { Button } from '~/components/ui/button';
import { Combobox } from '~/components/ui/combobox';
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
import { stringifyError } from '~/util';

export default ((props) => {
  const connection = useConnection();
  const feature = () => props.wallet.features[SolanaSignTransaction];
  const accountsWithSignTransaction = createMemo(() =>
    props.wallet.accounts.filter((account) =>
      account.features.includes(SolanaSignTransaction),
    ),
  );
  const onSignTransaction = (
    addresses: string[],
    amount: string | null,
    to: string | null,
  ) => {
    const accounts = accountsWithSignTransaction().filter(
      (account) => !!addresses.find((a) => a === account.address),
    );
    if (accounts.length !== addresses.length) {
      throw new Error(
        `Expected ${addresses.length} accounts, got ${accounts.length}. Bug in tester`,
      );
    }
    let toPublicKey: PublicKey | null = null;
    if (to !== null && to !== '') {
      toPublicKey = new PublicKey(to);
    }

    const buildTransactions = (rbh: Blockhash, lamports: number) =>
      accounts.map((account) => {
        const transaction = new Transaction();
        transaction.add(
          SystemProgram.transfer({
            lamports,
            toPubkey: toPublicKey ?? new PublicKey(account.publicKey),
            fromPubkey: new PublicKey(account.publicKey),
          }),
        );
        transaction.recentBlockhash = rbh;
        transaction.feePayer = new PublicKey(account.publicKey);
        return transaction;
      });
    if (accounts.length === 0) {
      throw new Error('No accounts selected');
    }
    toast.promise(
      connection()
        .getLatestBlockhash()
        // eslint-disable-next-line solid/reactivity
        .then((rbh) => {
          let lamports: number;
          if (amount === null || amount === '') {
            lamports = 0;
          } else {
            try {
              lamports = parseInt(amount);
            } catch (e) {
              console.error(e);
              throw new Error(`Invalid lamports: ${amount}: ${e}`);
            }
          }
          const transactions = buildTransactions(rbh.blockhash, lamports);

          return feature().signTransaction(
            ...accounts.map((account, index) => ({
              account,
              transaction: transactions[index].serialize({
                requireAllSignatures: false,
              }),
            })),
          );
        })

        .then((sigs) => {
          if (sigs.length !== accounts.length) {
            throw new Error(
              `Expected ${accounts.length} signatures, got ${sigs.length}`,
            );
          }
          sigs.forEach(() => {
            // TODO: Validate signature
          });
        }),
      {
        loading: `Signing transaction${accounts.length === 1 ? '' : 's'}...`,
        success: `Transaction${accounts.length === 1 ? '' : 's'} signed successfully. Signature verification not yet implemented.`,
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
  const [to, setTo] = createSignal<string>('');
  const [lamports, setLamports] = createSignal<string>('');
  const disableSign = () => selectedAccounts().length === 0;
  const [transactionVersion, setTransactionVersion] =
    createSignal<SolanaSignTransactionVersion | null>(null);

  return (
    <div class="grid grid-cols-1 items-center justify-between gap-1">
      <div>{`Version: ${feature().version}`}</div>
      <div>
        Supported tx versions:{' '}
        {JSON.stringify(feature().supportedTransactionVersions)}
      </div>
      <Dialog>
        <DialogTrigger
          as={Button<'button'>}
          disabled={accountsWithSignTransaction().length === 0}
        >
          Sign Transaction
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Transaction</DialogTitle>
            <DialogDescription>
              Sign a transaction sending lamports. All listed accounts should
              successfully sign. Only legacy transactions are currently
              supported.
            </DialogDescription>
          </DialogHeader>

          <Combobox
            options={[...feature().supportedTransactionVersions]}
            value={transactionVersion()}
            onChange={setTransactionVersion}
          />

          <SelectWalletComboBox
            selectedAccounts={[selectedAccounts, setSelectedAccounts]}
            accounts={accountsWithSignTransaction()}
            fallbackText={`No accounts support ${SolanaSignTransaction}`}
          />

          <TextField class="grid grid-cols-4 items-center gap-4">
            <TextFieldLabel>To</TextFieldLabel>
            <TextFieldInput
              class={'col-span-3'}
              value={to() ?? ''}
              type="text"
              placeholder={'<account>'}
              onInput={(e) => setTo((e.target as HTMLInputElement).value ?? '')}
            />
          </TextField>

          <TextField class="grid grid-cols-4 items-center gap-4">
            <TextFieldLabel>Lamports</TextFieldLabel>
            <TextFieldInput
              class={'col-span-3'}
              value={lamports() ?? ''}
              type="number"
              placeholder={'0'}
              onInput={(e) =>
                setLamports((e.target as HTMLInputElement).value ?? '')
              }
            />
          </TextField>

          <DialogFooter>
            <Button
              onClick={() =>
                onSignTransaction(
                  selectedAccounts().map((a) => a.account.address),
                  lamports(),
                  to(),
                )
              }
              disabled={disableSign()}
            >
              Sign Transaction{selectedAccounts().length === 1 ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}) satisfies Component<FeatureProps<SolanaSignTransactionFeature>>;
