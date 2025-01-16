export function connectWebSocket(setMessages: React.Dispatch<React.SetStateAction<{ text: string; sender: string; time: string }[]>>) {
    const ws = new WebSocket('ws://localhost:1337/websocket'); 
  
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
  
    ws.onmessage = (event) => {
      const incomingMessage = event.data;
      const currentTime = new Date().toLocaleTimeString();

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: incomingMessage, sender: 'server', time: currentTime },
      ]);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  
    return ws;
  }
  