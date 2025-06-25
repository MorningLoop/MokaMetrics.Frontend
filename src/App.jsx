import { Routes, BrowserRouter, Route } from "react-router-dom";
import Orders from "./orders/Orders";
import Dashboard from "./dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import Customers from "./customers/Customers";
import { useEffect } from "react";
import {getStatusMachines} from "./providers/status/statusMachinesProvider";



export default function App() {
  useEffect(() => {
    console.log(getStatusMachines());
  }, []);
  return (
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
  )
} 
