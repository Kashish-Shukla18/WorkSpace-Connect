import { createContext, useContext } from 'react';

export const AppContext = createContext({
  currentUser: null,
  socket: null,
  socketReady: false,
});

export const useApp = () => useContext(AppContext);
