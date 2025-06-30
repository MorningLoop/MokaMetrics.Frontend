import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
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
    {
      id: "cnc_brazil_1",
      name: "cnc_brazil_1", 
      status: getStatusEnum("pending"),
      factoryId: 1,
      location: "brazil",
      error: null,
    },
    {
      id: "lathe_brazil_1",
      name: "lathe_brazil_1",
      status: getStatusEnum("pending"),
      factoryId: 1,
      location: "brazil",
      error: null,
    },
    {
      id: "mill_brazil_1",
      name: "mill_brazil_1",
      status: getStatusEnum("pending"),
      factoryId: 1,
      location: "brazil",
      error: null,
    },
    {
      id: "assembly_brazil_1",
      name: "assembly_brazil_1",
      status: getStatusEnum("pending"),
      factoryId: 1,
      location: "brazil",
      error: null,
    },

    // Factory 2 - Italy
    {
      id: "cnc_italy_1",
      name: "cnc_italy_1",
      status: getStatusEnum("pending"),
      factoryId: 2,
      location: "italy",
      error: null,
    },
    {
      id: "lathe_italy_1",
      name: "lathe_italy_1",
      status: getStatusEnum("pending"),
      factoryId: 2,
      location: "italy",
      error: null,
    },
    {
      id: "mill_italy_1",
      name: "mill_italy_1",
      status: getStatusEnum("pending"),
      factoryId: 2,
      location: "italy",
      error: null,
    },
    {
      id: "assembly_italy_1",
      name: "assembly_italy_1",
      status: getStatusEnum("pending"),
      factoryId: 2,
      location: "italy",
      error: null,
    },

    // Factory 3 - Vietnam
    {
      id: "cnc_vietnam_1",
      name: "cnc_vietnam_1",
      status: getStatusEnum("pending"),
      factoryId: 3,
      location: "vietnam",
      error: null,
    },
    {
      id: "lathe_vietnam_1",
      name: "lathe_vietnam_1",
      status: getStatusEnum("pending"),
      factoryId: 3,
      location: "vietnam",
      error: null,
    },
    {
      id: "mill_vietnam_1",
      name: "mill_vietnam_1",
      status: getStatusEnum("pending"),
      factoryId: 3,
      location: "vietnam",
      error: null,
    },
    {
      id: "assembly_vietnam_1",
      name: "assembly_vietnam_1",
      status: getStatusEnum("pending"),
      factoryId: 3,
      location: "vietnam",
      error: null,
    },
  ]);

  const connectionRef = useRef(null);

  const newSignalRConnection = () => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_APP_SIGNALR_HUB_URL)
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
      console.log(JSON.parse(args));
    });

    conn.on("orderFulfilled", (args) => {
      console.log(JSON.parse(args));
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
    statusMachines,
    setStatusMachines,
  };

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
}
