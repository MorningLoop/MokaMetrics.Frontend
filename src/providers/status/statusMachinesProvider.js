let socket = null;
let onMessageCallback = null;

export function initializeWebSocket(onStatusUpdate) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket("ws://localhost:5129/ws/status");
  onMessageCallback = onStatusUpdate;

  socket.addEventListener("open", event => {
    console.log("WebSocket connesso");
  });

  socket.addEventListener("message", event => {
    console.log("Dati ricevuti dal server:", event.data);
    try {
      const statusData = JSON.parse(event.data);

        const processedMachine = {
          lot_code: statusData.lot_code || "N/A",
          cycle_time: statusData.cycle_time || 0.0,
          cutting_depth: statusData.cutting_depth || 0.0,
          vibration: statusData.vibration || 0,
          tool_alarms: statusData.tool_alarms || "None",
          local_timestamp: statusData.local_timestamp || "",
          utc_timestamp: statusData.utc_timestamp || "",
          site: statusData.site || "Unknown",
          machine_id: statusData.machine_id || "Unknown",
          timestamp: statusData.timestamp || new Date().toISOString(),
          status : statusData.status || "pending",
        };
        
        if (onMessageCallback) {
          onMessageCallback(processedMachine);
        }
      
    } catch (error) {
      console.error("Errore parsing dati WebSocket:", error);
      console.error("Dati ricevuti:", event.data);
    }
  });

  socket.addEventListener("close", event => {
    console.log("WebSocket disconnesso");
    // Riconnessione automatica dopo 3 secondi
    setTimeout(() => {
      if (onMessageCallback) {
        initializeWebSocket(onMessageCallback);
      }
    }, 3000);
  });

  socket.addEventListener("error", error => {
    console.error("Errore WebSocket:", error);
  });

  return socket;
}

export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
    onMessageCallback = null;
  }
}

export function getStatusMachines() {
  return socket;
}