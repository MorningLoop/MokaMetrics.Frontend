import { Routes, BrowserRouter, Route } from "react-router-dom";
import OrderForm from "./orderForm/OrderForm";
import Dashboard from "./dashboard/Dashboard";
import StatusFactory from "./status/StatusFactory";
import './index.css';
import Layout from "./components/Layout";
import Customers from "./customers/Customers";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/order-form" element={<OrderForm />} />
            <Route index element={<Dashboard />} />
            <Route path="/status/:idFactory" element={<StatusFactory />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Routes>
      </BrowserRouter>
  )
} 
