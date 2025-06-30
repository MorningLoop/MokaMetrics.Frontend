import { Routes, BrowserRouter, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import Customers from "./pages/customers/Customers";
import { useEffect, useState, createContext } from "react";
import Orders from "./pages/orders/Orders";
import CreateNewOrder from "./pages/orders/CreateNewOrder";
import { SignalRContextProvider } from "./contexts/signalRContext";


// Creo il contesto per gli stati delle macchine
export const StatusContext = createContext();

export default function App() {
  return (
    <SignalRContextProvider>
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
    </SignalRContextProvider>
  );
} 
