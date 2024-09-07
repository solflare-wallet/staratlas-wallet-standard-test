import { Connection, ConnectionConfig } from '@solana/web3.js';
import {
  Accessor,
  createContext,
  createMemo,
  FlowComponent,
  useContext,
} from 'solid-js';

const connectionContext = createContext<Accessor<Connection>>();

export const ConnectionProvider: FlowComponent<
  {
    endpoint: string;
  } & ConnectionConfig
> = (props) => {
  const connection = createMemo(() => new Connection(props.endpoint, props));
  return (
    <connectionContext.Provider value={connection}>
      {props.children}
    </connectionContext.Provider>
  );
};
export const useConnection = () => {
  const connection = useContext(connectionContext);
  if (!connection) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return connection;
};
