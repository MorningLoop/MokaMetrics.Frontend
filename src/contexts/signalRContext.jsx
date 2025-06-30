import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

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
      id: "cnc_brazil",
      name: "CNC machine Brazil",
      status: "pending",
      factoryId: 1,
      error: null,
    },
    {
      id: "lathe_brazil",
      name: "Lathe machine Brazil",
      status: "pending",
      factoryId: 1,
      error: null,
    },
    {
      id: "assembly_brazil",
      name: "Assembly machine Brazil",
      status: "pending",
      factoryId: 1,
      error: null,
    },
    {
      id: "test_brazil",
      name: "Test machine Brazil",
      status: "pending",
      factoryId: 1,
      error: null,
    },

    // Factory 2 - Italy
    {
      id: "cnc_italy",
      name: "CNC machine Italy",
      status: "pending",
      factoryId: 2,
      error: null,
    },
    {
      id: "lathe_italy",
      name: "Lathe machine Italy",
      status: "pending",
      factoryId: 2,
      error: null,
    },
    {
      id: "assembly_italy",
      name: "Assembly machine Italy",
      status: "pending",
      factoryId: 2,
      error: null,
    },
    {
      id: "test_italy",
      name: "Test machine Italy",
      status: "pending",
      factoryId: 2,
      error: null,
    },

    // Factory 3 - Vietnam
    {
      id: "cnc_vietnam",
      name: "CNC machine Vietnam",
      status: "pending",
      factoryId: 3,
      error: null,
    },
    {
      id: "lathe_vietnam",
      name: "Lathe machine Vietnam",
      status: "pending",
      factoryId: 3,
      error: null,
    },
    {
      id: "assembly_vietnam",
      name: "Assembly machine Vietnam",
      status: "pending",
      factoryId: 3,
      error: null,
    },
    {
      id: "test_vietnam",
      name: "Test machine Vietnam",
      status: "pending",
      factoryId: 3,
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
      console.log(statusData);
      // Update machine status based on received data
      setStatusMachines((prev) =>
        prev.map((machine) =>
          machine.id === statusData.machineId
            ? { ...machine, status: statusData.status }
            : machine
        )
      );
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
