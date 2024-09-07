import {
  StandardEvents,
  StandardEventsFeature,
} from '@wallet-standard/features';
import { Component, For, Show } from 'solid-js';
import { FeatureProps } from '~/features/index';

export default ((props) => {
  const feature = () => props.wallet.features[StandardEvents];
  return (
    <div class="grid grid-cols-1 items-center justify-between gap-1">
      <div>{`Version: ${feature().version}`}</div>
      <div>
        <strong>Events</strong>
        <Show
          when={props.wallet.events !== null && props.wallet.events}
          fallback={'Bad state, should not happen'}
        >
          {(events) => {
            return (
              <div class={'grid grid-cols-1'}>
                <For each={events()} fallback={'No Events'}>
                  {(event) => <div>{event}</div>}
                </For>
              </div>
            );
          }}
        </Show>
      </div>
    </div>
  );
}) satisfies Component<FeatureProps<StandardEventsFeature>>;
