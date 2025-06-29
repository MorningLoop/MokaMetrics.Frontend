import { Routes, BrowserRouter, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import Customers from "./pages/customers/Customers";
import { useEffect, useState, createContext } from "react";
import {initializeSignalR, closeSignalR} from "./providers/status/statusMachinesProvider";
import Orders from "./pages/orders/Orders";
import CreateNewOrder from "./pages/orders/CreateNewOrder";


// Creo il contesto per gli stati delle macchine
export const StatusContext = createContext();

export default function App() {
  const [statusMachines, setStatusMachines] = useState([
    // Factory 1 - Italy (4 macchine)
    { id: "CNC-01", name: "Macchina CNC-01", status: "pending", factoryId: 1, error: null },
    { id: "CNC-02", name: "Macchina CNC-02", status: "pending", factoryId: 1, error: null },
    { id: "CNC-03", name: "Macchina CNC-03", status: "pending", factoryId: 1, error: null },
    { id: "CNC-04", name: "Macchina CNC-04", status: "pending", factoryId: 1, error: null },
    
    // Factory 2 - Vietnam (4 macchine)
    { id: "LATHE-01", name: "Macchina LATHE-01", status: "pending", factoryId: 2, error: null },
    { id: "LATHE-02", name: "Macchina LATHE-02", status: "pending", factoryId: 2, error: null },
    { id: "LATHE-03", name: "Macchina LATHE-03", status: "pending", factoryId: 2, error: null },
    { id: "LATHE-04", name: "Macchina LATHE-04", status: "pending", factoryId: 2, error: null },
    
    // Factory 3 - Brasil (4 macchine)
    { id: "MILL-01", name: "Macchina MILL-01", status: "pending", factoryId: 3, error: null },
    { id: "MILL-02", name: "Macchina MILL-02", status: "pending", factoryId: 3, error: null },
    { id: "MILL-03", name: "Macchina MILL-03", status: "pending", factoryId: 3, error: null },
    { id: "MILL-04", name: "Macchina MILL-04", status: "pending", factoryId: 3, error: null }
  ]);

  useEffect(() => {
    // Funzione callback per aggiornare il contesto quando arrivano dati SignalR
    const handleStatusUpdate = (newStatusData) => {
      console.log("Aggiornamento stati macchine da SignalR:", newStatusData);
      
      // Nuovo formato: {location:str, machine:str, status:str, errormessage:str}
      setStatusMachines(prevMachines => {
        const updatedMachines = [...prevMachines];
        
        // Trova la macchina per nome o ID
        const existingIndex = updatedMachines.findIndex(
          machine => machine.id === newStatusData.machine || 
                    machine.name === newStatusData.machine ||
                    machine.name.includes(newStatusData.machine)
        );
        
        if (existingIndex !== -1) {
          // Aggiorna macchina esistente
          updatedMachines[existingIndex] = {
            ...updatedMachines[existingIndex],
            status: newStatusData.status,
            error: newStatusData.errormessage || null,
            location: newStatusData.location,
            lastUpdate: new Date().toISOString()
          };
        } else {
          // Aggiungi nuova macchina se non esiste
          updatedMachines.push({
            id: newStatusData.machine,
            name: newStatusData.machine,
            status: newStatusData.status,
            error: newStatusData.errormessage || null,
            location: newStatusData.location,
            factoryId: getFactoryIdFromLocation(newStatusData.location),
            lastUpdate: new Date().toISOString()
          });
        }
        
        return updatedMachines;
      });
    };

    // Funzione helper per determinare factoryId dalla location
    const getFactoryIdFromLocation = (location) => {
      if (!location) return 1;
      
      const locationLower = location.toLowerCase();
      if (locationLower.includes('italy') || locationLower.includes('italia')) return 1;
      if (locationLower.includes('vietnam')) return 2;
      if (locationLower.includes('brasil') || locationLower.includes('brazil')) return 3;
      
      return 1; // Default
    };

    // Inizializza SignalR
    const initSignalR = async () => {
      try {
        console.log("Inizializzazione SignalR...");
        const connection = await initializeSignalR(handleStatusUpdate);
        if (connection) {
          console.log("SignalR inizializzato con successo");
        } else {
          console.warn("SignalR non è riuscito a connettersi. L'app continuerà con dati mock.");
        }
      } catch (error) {
        console.error("Errore inizializzazione SignalR:", error);
        console.warn("L'app continuerà con dati mock.");
      }
    };

    initSignalR();

    // Cleanup quando il componente viene smontato
    return () => {
      closeSignalR();
    };
  }, []);

  return (
    <StatusContext.Provider value={{ statusMachines, setStatusMachines }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/orders" element={<Orders />} />
            <Route path="/create-order" element={<CreateNewOrder />} />
            <Route index element={<Dashboard />} />
            <Route path="/status/:idFactory" element={<StatusFactory />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StatusContext.Provider>
  );
} 
