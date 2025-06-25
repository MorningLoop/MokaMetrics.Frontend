  const socket = new WebSocket("ws://localhost:5129/ws/status");
  
  export function getStatusMachines() {
    socket.addEventListener("open", event => {
      socket.send("Connection established")
    });

    // Listen for messages
    socket.addEventListener("message", event => {
      console.log("Message from server ", event.data)
    });
  }