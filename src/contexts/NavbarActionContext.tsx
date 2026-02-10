import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavbarActionContextType {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
}

const NavbarActionContext = createContext<NavbarActionContextType | undefined>(undefined);

export const NavbarActionProvider = ({ children }: { children: ReactNode }) => {
  const [actions, setActions] = useState<ReactNode | null>(null);

  return (
    <NavbarActionContext.Provider value={{ actions, setActions }}>
      {children}
    </NavbarActionContext.Provider>
  );
};

export const useNavbarActions = () => {
  const context = useContext(NavbarActionContext);
  if (!context) {
    throw new Error("useNavbarActions must be used within a NavbarActionProvider");
  }
  return context;
};
