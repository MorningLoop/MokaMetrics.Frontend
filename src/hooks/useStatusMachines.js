import { useContext } from 'react';
import { StatusContext } from '../App';

export const useStatusMachines = () => {
  const context = useContext(StatusContext);
  
  if (!context) {
    throw new Error('useStatusMachines deve essere utilizzato all\'interno di un StatusContext.Provider');
  }
  
  return context;
};
