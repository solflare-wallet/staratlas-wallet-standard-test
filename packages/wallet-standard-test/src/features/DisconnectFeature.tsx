import {
  StandardDisconnect,
  StandardDisconnectFeature,
} from '@wallet-standard/features';
import { Component } from 'solid-js';
import { toast } from 'solid-sonner';
import { Button } from '~/components/ui/button';
import { FeatureProps } from '~/features/index';
import { stringifyError } from '~/util';

export default ((props) => {
  const feature = () => props.wallet.features[StandardDisconnect];
  return (
    <div class={'grid grid-cols-2 items-center justify-between gap-1'}>
      <div>{`Version: ${feature().version}`}</div>
      <Button
        onClick={() => {
          const name = props.wallet.name;
          toast.promise(feature().disconnect(), {
            loading: `Disconnecting ${name}`,
            success: `Disconnected from ${name}`,
            error: (e) => {
              console.error(e);
              return `Failed to disconnect from ${name}: ${stringifyError(e)}`;
            },
          });
        }}
      >
        Disconnect
      </Button>
    </div>
  );
}) satisfies Component<FeatureProps<StandardDisconnectFeature>>;
