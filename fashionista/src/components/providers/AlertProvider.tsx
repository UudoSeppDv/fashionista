import React, { createContext, useContext, useState, useCallback } from "react";

type Alert = {
  id: number;
  message: string;
  resolve: (value: boolean) => void;
  showCancel?: boolean;
};

type AlertContextType = {
  showAlert: (message: string, showCancel?: boolean) => Promise<boolean>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Alert[]>([]);
  const currentAlert = queue.length > 0 ? queue[0] : null;

  const showAlert = useCallback((message: string, showCancel = true) => {
    return new Promise<boolean>((resolve) => {
      setQueue((q) => [
        ...q,
        { id: Date.now() + Math.random(), message, resolve, showCancel },
      ]);
    });
  }, []);

  const handleConfirm = () => {
    if (!currentAlert) return;
    currentAlert.resolve(true);
    setQueue((q) => q.slice(1));
  };

  const handleCancel = () => {
    if (!currentAlert) return;
    currentAlert.resolve(false);
    setQueue((q) => q.slice(1));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {currentAlert && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
            }}
          >
            <p>{currentAlert.message}</p>
            <button onClick={handleConfirm} style={{ marginRight: 10 }}>OK</button>
            {currentAlert.showCancel && (
              <button onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return ctx;
}
