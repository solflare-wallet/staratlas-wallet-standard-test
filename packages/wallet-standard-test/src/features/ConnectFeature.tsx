import {
  StandardConnect,
  StandardConnectFeature,
  StandardConnectInput,
} from '@wallet-standard/features';
import { Component } from 'solid-js';
import { toast } from 'solid-sonner';
import { Button } from '~/components/ui/button';
import { FeatureProps } from '~/features/index';
import { stringifyError } from '~/util';

export default ((props) => {
  const feature = () => props.wallet.features[StandardConnect];

  const connect = (input?: StandardConnectInput) => {
    const name = props.wallet.name;
    toast.promise(feature().connect(input), {
      loading: `Connecting to ${name} ${input?.silent ? 'silently' : ''}`,
      success: `Connected to ${name} ${input?.silent ? 'silently' : ''}`,
      error: (e) => {
        console.error(e);
        return `Failed to connect to ${name} ${input?.silent ? 'silently' : ''}: ${stringifyError(e)}`;
      },
    });
  };
  return (
    <div class={'grid grid-cols-2 items-center justify-between gap-2'}>
      <div class={'col-span-2'}>{`Version: ${feature().version}`}</div>
      <div class={'w-32 text-sm text-muted-foreground'}>
        Can Require user interaction.
      </div>
      <Button class={'w-32'} onClick={() => connect()}>
        Connect
      </Button>
      <div class={'w-32 text-sm text-muted-foreground'}>
        No user interaction or fail.
      </div>
      <Button class={'w-32'} onClick={() => connect({ silent: true })}>
        Connect Silent
      </Button>
    </div>
  );
}) satisfies Component<FeatureProps<StandardConnectFeature>>;
