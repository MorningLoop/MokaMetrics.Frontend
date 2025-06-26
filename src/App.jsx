import { Routes, BrowserRouter, Route } from "react-router-dom";
import Orders from "./orders/Orders";
import Dashboard from "./dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import Customers from "./customers/Customers";
import { useEffect, useState, createContext } from "react";
import {initializeWebSocket, closeWebSocket} from "./providers/status/statusMachinesProvider";


// Creo il contesto per gli stati delle macchine
export const StatusContext = createContext();

export default function App() {
  const [statusMachines, setStatusMachines] = useState([
    // Factory 1 - Italy (4 macchine)
    { machine_id: "CNC-01", status: "pending", factoryId: 1, error: null },
    { machine_id: "CNC-02", status: "pending", factoryId: 1, error: null },
    { machine_id: "CNC-03", status: "pending", factoryId: 1, error: null },
    { machine_id: "CNC-04", status: "pending", factoryId: 1, error: null },
    
    // Factory 2 - Vietnam (4 macchine)
    { machine_id: "LATHE-01", status: "pending", factoryId: 2, error: null },
    { machine_id: "LATHE-02", status: "pending", factoryId: 2, error: null },
    { machine_id: "LATHE-03", status: "pending", factoryId: 2, error: null },
    { machine_id: "LATHE-04", status: "pending", factoryId: 2, error: null },
    
    // Factory 3 - Brasil (4 macchine)
    { machine_id: "MILL-01",  status: "pending", factoryId: 3, error: null },
    { machine_id: "MILL-02",  status: "pending", factoryId: 3, error: null },
    { machine_id: "MILL-03",  status: "pending", factoryId: 3, error: null },
    { machine_id: "MILL-04",  status: "pending", factoryId: 3, error: null }
  ]);

  useEffect(() => {
    // Funzione callback per aggiornare il contesto quando arrivano dati WebSocket
    const handleStatusUpdate = (newStatusData) => {
      console.log("Aggiornamento stati macchine:", newStatusData);
      
      // Se newStatusData è un array, sostituisci/aggiorna tutto
      if (Array.isArray(newStatusData)) {
        setStatusMachines(prevMachines => {
          const updatedMachines = [...prevMachines];
          
          newStatusData.forEach(newMachine => {
            const existingIndex = updatedMachines.findIndex(
              machine => machine.machine_id === newMachine.machine_id
            );
            
            if (existingIndex !== -1) {
              // Aggiorna macchina esistente
              updatedMachines[existingIndex] = {
                ...updatedMachines[existingIndex],
                ...newMachine,
                timestamp: new Date().toISOString()
              };
            } else {
              // Aggiungi nuova macchina
              updatedMachines.push({
                ...newMachine,
                timestamp: new Date().toISOString()
              });
            }
          });
          
          return updatedMachines;
        });
      } else {
        // Se è un singolo oggetto, aggiorna solo quella macchina
        setStatusMachines(prevMachines => {
          const updatedMachines = [...prevMachines];
          const existingIndex = updatedMachines.findIndex(
            machine => machine.machine_id === newStatusData.machine_id
          );
          
          if (existingIndex !== -1) {
            // Aggiorna macchina esistente
            updatedMachines[existingIndex] = {
              ...updatedMachines[existingIndex],
              ...newStatusData,
              timestamp: new Date().toISOString()
            };
          } else {
            // Aggiungi nuova macchina
            updatedMachines.push({
              ...newStatusData,
              timestamp: new Date().toISOString()
            });
          }
          
          return updatedMachines;
        });
      }
    };

    // Inizializza WebSocket
    const socket = initializeWebSocket(handleStatusUpdate);

    // Cleanup quando il componente viene smontato
    return () => {
      closeWebSocket();
    };
  }, []);

  return (
    <StatusContext.Provider value={{ statusMachines, setStatusMachines }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/orders" element={<Orders />} />
            <Route index element={<Dashboard />} />
            <Route path="/status/:idFactory" element={<StatusFactory />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StatusContext.Provider>
  );
} 
