import { createContext, ReactNode } from 'react';

import { useRouter } from 'next/router';

import Sidebar from '../components/Siderbar/sidebar';

interface SideBarProviderProps {
  children: ReactNode;
}

export const SideBarContext = createContext({});

export function SideBarProvider({ children }: SideBarProviderProps) {
  const router = useRouter();
  const { pathname } = router;

  const showSideBar = pathname !== '/';

  return (
    <SideBarContext.Provider value={{}}>
      <Sidebar screen={children} display={showSideBar} />
    </SideBarContext.Provider>
  );
}
