import * as signalR from "@microsoft/signalr";
import { getStatusEnum } from "../../services/statusParser";

let connection = null;
let onMessageCallback = null;

export async function initializeSignalR(onStatusUpdate) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log("SignalR già connesso");
    return connection;
  }

  // Recupera l'URL dall'environment
  const hubUrl = import.meta.env.VITE_APP_SIGNALR_HUB_URL;
  console.log("Variabili environment disponibili:", import.meta.env);
  console.log("Hub URL configurato dal .env:", hubUrl);
  
  if (!hubUrl) {
    console.error("VITE_APP_SIGNALR_HUB_URL non trovato nelle variabili d'ambiente");
    console.error("Verifica che il file .env contenga: VITE_APP_SIGNALR_HUB_URL=https://localhost:7218/productionHub");
    return null;
  }

  onMessageCallback = onStatusUpdate;

  // Creazione connessione seguendo l'esempio fornito
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();

  // Event handlers
  connection.onclose(() => {
    console.log("SignalR connection closed");
  });

  connection.onreconnecting(() => {
    console.log("SignalR reconnecting...");
  });

  connection.onreconnected(() => {
    console.log("SignalR reconnected");
  });

  // Handler per i diversi eventi
  connection.on("lotCompleted", (args) => {
    console.log("Lot completed:", args);
    try {
      const data = typeof args === 'string' ? JSON.parse(args) : args;
      console.log("Lot completed parsed:", data);
    } catch (e) {
      console.log("Lot completed (raw):", args);
    }
  });

  connection.on("orderFulfilled", (args) => {
    console.log("Order fulfilled:", args);
    try {
      const data = typeof args === 'string' ? JSON.parse(args) : args;
      console.log("Order fulfilled parsed:", data);
    } catch (e) {
      console.log("Order fulfilled (raw):", args);
    }
  });

  connection.on("status", (args) => {
    console.log("🔄 Status update received:", args);
    try {
      const statusData = typeof args === 'string' ? JSON.parse(args) : args;
      console.log("📊 Dati ricevuti:", statusData);
      // Formato JSON ricevuto: {Location:str, Machine:str, Status:number, ErrorMessage:str}
      const processedMachine = {
        location: statusData.Location || statusData.location || "Unknown",
        machine: statusData.Machine || statusData.machine || "Unknown", 
        status: getStatusEnum(statusData.Status !== undefined ? statusData.Status : statusData.status),
        errormessage: statusData.ErrorMessage || statusData.errormessage || "",
        timestamp: new Date().toISOString(),
      };
      
      if (onMessageCallback) {
        onMessageCallback(processedMachine);
      }
    } catch (error) {
      console.error("❌ Errore processing dati SignalR status:", error);
      console.error("Raw data received:", args);
    }
  });

  // Listener generico per catturare qualsiasi evento
  connection.onclose((error) => {
    console.log("SignalR connection closed", error);
  });

  connection.onreconnecting((error) => {
    console.log("SignalR reconnecting...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("SignalR reconnected with ID:", connectionId);
  });

  // Aggiungiamo altri possibili nomi di eventi
  connection.on("StatusUpdate", (args) => {
    console.log("🔄 StatusUpdate (PascalCase) received:", args);
  });

  connection.on("machineStatus", (args) => {
    console.log("🔄 machineStatus received:", args);
  });

  connection.on("MachineStatusUpdate", (args) => {
    console.log("🔄 MachineStatusUpdate received:", args);
  });

  connection.on("productionUpdate", (args) => {
    console.log("🔄 productionUpdate received:", args);
  });

  connection.on("ProductionStatusUpdate", (args) => {
    console.log("🔄 ProductionStatusUpdate received:", args);
  });

  // Avvio connessione
  const startConnection = async () => {
    try {
      await connection.start();
      console.log("SignalR hub connected successfully!");
      console.log("Connection state:", connection.state);
      console.log("Connection ID:", connection.connectionId);
      
      // Test per vedere se il server risponde
      if (connection.invoke) {
        try {
          // Prova a invocare un metodo del hub se disponibile
          console.log("Testing connection by sending ping...");
          // Nota: questo metodo potrebbe non esistere, ma ci dirà se la connessione funziona
        } catch (invokeError) {
          console.log("Hub invoke test:", invokeError.message);
        }
      }
      
      return connection;
    } catch (error) {
      console.error("Errore connessione SignalR:", error);
      console.error("Dettagli errore:", {
        message: error.message,
        stack: error.stack,
        hubUrl: hubUrl
      });
      return null;
    }
  };

  return await startConnection();
}

export async function closeSignalR() {
  if (connection) {
    await connection.stop();
    connection = null;
    onMessageCallback = null;
  }
}

export function getStatusConnection() {
  return connection;
}

// Manteniamo le vecchie funzioni per compatibilità, ma deprecate
export function initializeWebSocket(onStatusUpdate) {
  console.warn("initializeWebSocket è deprecata, usa initializeSignalR");
  return initializeSignalR(onStatusUpdate);
}

export function closeWebSocket() {
  console.warn("closeWebSocket è deprecata, usa closeSignalR");
  return closeSignalR();
}

export function getStatusMachines() {
  console.warn("getStatusMachines è deprecata, usa getStatusConnection");
  return getStatusConnection();
}