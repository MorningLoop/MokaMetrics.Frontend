import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { message, notification } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { getStatusEnum } from "../services/statusParser";

/**
 * @const SignalRContext
 */
export const SignalRContext = React.createContext();

/**
 * @function AddSignalRProvider
 * @param {*} props
 * @returns
 */
export function SignalRContextProvider({ children }) {
  const [statusMachines, setStatusMachines] = useState([
    // Factory 1 - Brazil  


  ]);

  // Stato per il grafico real-time degli ordini
  const [realtimeData, setRealtimeData] = useState([
    // Alcuni dati iniziali per mostrare il grafico
    { time: "00:00", orders: 0, lots: 0, timestamp: Date.now() - 60000 },
  ]);

  const [api, contextHolder] = notification.useNotification();

  const API_BASE_URL = "https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net";

  const connectionRef = useRef(null);

  const newSignalRConnection = () => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://mokametrics-api-fafshjgtf4degege.italynorth-01.azurewebsites.net/productionHub")
      .withAutomaticReconnect()
      .build();

    conn.onclose((err) => {
      console.error("SignalR connection closed", error);
      setConnectionState("disconnected");
    });

    conn.onreconnecting((err) => {
      console.error("SignalR reconnecting...", error);
      setConnectionState("reconnecting");
    });

    conn.onreconnected((connId) => {
      console.log("reconnected with id:", connId);
      setConnectionState("connected");
    });

    conn.on("lotCompleted", (args) => {
      const orderData = JSON.parse(args);
      console.log("lot completed:", orderData);

      // Aggiorna i dati del grafico real-time per i lotti
      const currentTime = new Date().toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setRealtimeData(prevData => {
        const newDataPoint = {
          time: currentTime,
          orders: prevData[prevData.length - 1]?.orders || 0, // Mantieni il contatore ordini
          lots: (prevData[prevData.length - 1]?.lots || 0) + 1, // Incrementa solo i lotti
          timestamp: new Date().getTime()
        };
        
        // Mantieni solo gli ultimi 20 punti dati per evitare che il grafico diventi troppo pesante
        const updatedData = [...prevData, newDataPoint].slice(-20);
        console.log("Updated realtime chart data (lot completed):", updatedData);
        return updatedData;
      });

      // Mostra notifica di successo
      api.success({
        message: 'Lotto Completato!',
        description: `L'ordine #${orderData.LotCode} è stato completato con successo. Ha prodotto ${orderData.LotProducedQuantity} pezzi.`,
        icon: <CheckCircleOutlined style={{ color: '#14b8a6' }} />,
        placement: 'topRight',
        duration: 5,
        showProgress: true,
      });

      
    });

    conn.on("orderFulfilled", (args) => {
      const orderData = JSON.parse(args);
      console.log("Order fulfilled:", orderData);

      // Aggiorna i dati del grafico real-time
      const currentTime = new Date().toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setRealtimeData(prevData => {
        const newDataPoint = {
          time: currentTime,
          orders: (prevData[prevData.length - 1]?.orders || 0) + 1,
          lots: (prevData[prevData.length - 1]?.lots || 0) + (orderData.lotsCount || 1),
          timestamp: new Date().getTime()
        };
        
        // Mantieni solo gli ultimi 20 punti dati per evitare che il grafico diventi troppo pesante
        const updatedData = [...prevData, newDataPoint].slice(-20);
        console.log("Updated realtime chart data:", updatedData);
        return updatedData;
      });

      api.success({
        message: 'Ordine Completato!',
        description: `L'ordine #${orderData.orderId} è stato completato con successo.`,
        icon: <CheckCircleOutlined style={{ color: '#14b8a6' }} />,
        placement: 'topRight',
        duration: null,
        showProgress: true,
        
      });
    });

    conn.on("status", (args) => {
      const statusData = JSON.parse(args);
      console.log("Received status data:", statusData);

      // Mappa i campi dal formato backend al formato frontend
      const mappedData = {
        id: statusData.Machine || statusData.machine,
        name: statusData.Machine || statusData.machine,
        machineId: statusData.Machine || statusData.machine,
        location: statusData.Location || statusData.location,
        status: getStatusEnum(statusData.Status !== undefined ? statusData.Status : statusData.status),
        error: statusData.ErrorMessage || statusData.errormessage || statusData.error,
        factoryId: statusData.Location === "italy" ? 2 : statusData.Location === "vietnam" ? 3 : 1, // Map location to factoryId
        timestamp: new Date().toISOString()
      };

      console.log("Mapped data:", mappedData);

      // Update machine status in the state
      setStatusMachines(prevMachines => {
        const existingMachineIndex = prevMachines.findIndex(machine =>
          machine.id === mappedData.id ||
          machine.name === mappedData.name ||
          machine.machineId === mappedData.machineId ||
          machine.id === mappedData.machineId
        );

        if (existingMachineIndex !== -1) {
          // Update existing machine
          const updatedMachines = [...prevMachines];
          updatedMachines[existingMachineIndex] = {
            ...updatedMachines[existingMachineIndex],
            ...mappedData
          };
          return updatedMachines;
        } else {
          // Add new machine if not found
          console.log("Adding new machine:", mappedData);
          return [...prevMachines, mappedData];
        }
      });
    });

    connectionRef.current = conn;
    return conn
  };

  const [connection, setConnection] = useState(newSignalRConnection());
  const [connectionState, setConnectionState] = useState("disconnected");

  const startConnection = () => {
    connectionRef.current
      .start()
      .then(() => {
        console.log("SignalR connected");
        setConnectionState("connected");
      })
      .catch((err) => {
        console.error("SignalR connection failed", err);
        setConnectionState("disconnected");
      });
  }

  useEffect(() => {
    console.log("Setting up SignalR connection...", connectionRef.current);
    startConnection();

    // stop connection
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
      }
    };
  }, []);

  useEffect(() => {
    // manual reconnection idk why, but i'll put this here
    if (connectionState === "disconnected") {
      console.log("trying to reconnect...");
      setConnection(newSignalRConnection());
      startConnection();
    }
  }, [connectionState]);

  const value = {
    API_BASE_URL,
    statusMachines,
    setStatusMachines,
    realtimeData,
    setRealtimeData,
  };

  return (

    <SignalRContext.Provider value={value}>
      {contextHolder}
      {children}
      </SignalRContext.Provider>
  );
}
