import { Routes, BrowserRouter, Route } from "react-router-dom";
import OrderForm from "./orderForm/OrderForm";
import Dashboard from "./dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import { createContext, useMemo } from "react";
import mqtt from "mqtt";
const Context = createContext({ name: 'Default' });

export default async function App() {
  const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

  const client = mqtt.connect("mqtt://test.mosquitto.org:8080" );

  client.on("connect", () => {
    client.subscribe("presence", (err) => {
      if (!err) {
        client.publish("presence", "Hello mqtt");
      }
    });
  });

  client.on("message", (topic, message) => {
    // message is Buffer
    console.log(message.toString());
    client.end();
  });

  return (
    <Context.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/order-form" element={<OrderForm />} />
            <Route index element={<Dashboard />} />
            <Route path="/status/:idFactory" element={<StatusFactory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  )
} 
