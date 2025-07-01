import { useContext } from "react";
import { SignalRContext } from "../contexts/signalRContext";

export const useStatusMachines = () => {
  const context = useContext(SignalRContext);

  if (!context) {
    throw new Error(
      "useStatusMachines deve essere utilizzato all'interno di un StatusContext.Provider"
    );
  }

  return context;
};
