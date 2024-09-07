import { WalletAccount } from '@wallet-standard/base';
import {
  Component,
  createEffect,
  createMemo,
  For,
  JSX,
  Signal,
} from 'solid-js';
import IconX from '~/components/icons/x.svg';
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxTrigger,
} from '~/components/ui/combobox';
import { formatKey } from '~/util';

export type WalletAccountWrapper = {
  account: WalletAccount;
  readable: string;
};

export default ((props) => {
  const wrappedAccounts = createMemo(() =>
    props.accounts.map((account) => ({
      account,
      readable: account.label ?? formatKey(account.address),
    })),
  );

  createEffect(() => {
    // eslint-disable-next-line solid/reactivity
    props.selectedAccounts[1]((accounts) =>
      accounts.filter((a) => {
        return props.accounts.find((account) => account === a.account);
      }),
    );
  });

  return (
    <Combobox<WalletAccountWrapper>
      multiple
      options={wrappedAccounts()}
      value={props.selectedAccounts[0]()}
      onChange={props.selectedAccounts[1]}
      optionValue={'readable'}
      optionTextValue={'readable'}
      optionLabel={'readable'}
      placeholder={
        props.accounts.length === 0
          ? props.fallbackText
          : 'Select an account...'
      }
      itemComponent={(props) => (
        <ComboboxItem item={props.item}>
          <ComboboxItemLabel>{props.item.rawValue.readable}</ComboboxItemLabel>
          <ComboboxItemIndicator />
        </ComboboxItem>
      )}
    >
      <ComboboxControl<WalletAccountWrapper> aria-label={'Account'}>
        {(state) => (
          <div class={'flex w-full items-center justify-between'}>
            <div>
              <For each={state.selectedOptions()}>
                {(option) => (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    class={
                      'mt-1 flex w-fit items-center gap-1 rounded border p-1'
                    }
                  >
                    {option.readable}
                    <button
                      class={'w-fit'}
                      onClick={() => state.remove(option)}
                    >
                      <IconX />
                    </button>
                  </div>
                )}
              </For>
              <ComboboxInput />
            </div>
            <div class={'flex items-center'}>
              <button
                onPointerDown={(e) => e.preventDefault()}
                onClick={state.clear}
              >
                <IconX />
              </button>
              <ComboboxTrigger />
            </div>
          </div>
        )}
      </ComboboxControl>
      <ComboboxContent />
    </Combobox>
  );
}) satisfies Component<{
  accounts: WalletAccount[];
  selectedAccounts: Signal<WalletAccountWrapper[]>;
  fallbackText: JSX.Element;
}>;
