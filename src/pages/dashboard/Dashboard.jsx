import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import apiService from '../../services/api';
import { Spin, message } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip as MapTooltip,
} from "react-leaflet";

import { TrendingUp, Package, Layers, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStatusMachines } from "../../hooks/useStatusMachines";
import RealTimeMachineStatus from "../../components/RealTimeMachineStatus";
import { MachineStatuses, getStatusEnum, getStatusColor } from "../../services/statusParser";


// ──────────────────────────────────────────────────────────────────────────────
//  MOCK DATA (sostituisci con chiamate API reali)
// ──────────────────────────────────────────────────────────────────────────────
const kpiDefault = {
  alarms: 0,
  activeOrders: 0,
};

const production = [
  { time: "00:00", value: 12 },
  { time: "02:00", value: 20 },
  { time: "04:00", value: 25 },
  { time: "06:00", value: 30 },
  { time: "08:00", value: 40 },
  { time: "10:00", value: 50 },
  { time: "12:00", value: 58 },
  { time: "14:00", value: 60 },
  { time: "16:00", value: 70 },
];

const plants = [
  {
    name: "Italy",
    position: [46.336829606339776, 13.138468541188923],
  },
  {
    name: "Brazil",
    position: [-13.920051047568641, -50.67785644713438],
  },
  {
    name: "Vietnam",
    position: [17.41240398788743, 102.8124039972215],
  },
];

const events = [
  {
    severity: "Warning",
    time: "12:56",
    plant: "Italy",
    message: "Vibration threshold exceeded",
  },
  {
    severity: "Error",
    time: "16:06",
    plant: "Brazil",
    message: "Cooling system issue – Line 3",
  },
  {
    severity: "Info",
    time: "14:45",
    plant: "Vietnam",
    message: "Temperature back to nominal",
  },
];

const factory =
  [
    {
      id: 1,
      name: "Italy",
      machines: [
        {
          name: "Macchina CNC2",
          status: getStatusEnum("error")
        },
        {
          name: "Macchina CNC3",
          status: getStatusEnum("error")
        },
        {
          name: "Macchina CNC4",
          status: getStatusEnum("error")
        }
        ,
        {
          name: "Macchina CNC4",
          status: getStatusEnum("idle")
        }
      ]
    },
    {
      id: 2,
      name: "Vietnam",
      machines: [
        {
          name: "Macchina CNC2",
          status: getStatusEnum("running")
        },
        {
          name: "Macchina CNC3",
          status: getStatusEnum("idle")
        },
        {
          name: "Macchina CNC4",
          status: getStatusEnum("running")
        },
        {
          name: "Macchina CNC4",
          status: getStatusEnum("error")
        }
      ]
    },
    {
      id: 3,
      name: "Brazil",
      machines: [
        {
          name: "Macchina CNC2",
          status: getStatusEnum("running")
        },
        {
          name: "Macchina CNC3",
          status: getStatusEnum("idle")
        },
        {
          name: "Macchina CNC4",
          status: getStatusEnum("running")
        },
        {
          name: "Macchina CNC4",
          status: getStatusEnum("error")
        }
      ]
    }
  ]

function KPI({ icon, label, value, className = "" }) {
  const Icon = icon;
  return (
    <div
      className={`rounded-2xl bg-zinc-800 p-4 flex items-center space-x-4 ${className}`}
    >
      <Icon className="w-6 h-6 text-teal-400 shrink-0" />
      <div>
        <div className="text-sm text-zinc-400 uppercase">{label}</div>
        <div className="text-2xl font-bold text-zinc-100">{value}</div>
      </div>
    </div>
  );
}

function ProductionChart() {
  return (
    <div className="rounded-2xl bg-zinc-800 p-4">
      <h2 className="text-zinc-100 text-lg mb-2">Production vs Target</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={production}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="time" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <ChartTooltip cursor={{ stroke: "#4b5563", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#14b8a6"
            fill="url(#prodGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PlantMap() {
  const { statusMachines } = useStatusMachines();

  // Calcola dinamicamente i valori per ogni plant basandosi sui dati reali delle macchine
  const plantsWithRealData = plants.map((plant) => {
    // Filtra le macchine per questa location/plant
    const plantMachines = statusMachines.filter(machine => 
      machine.location && machine.location.toLowerCase() === plant.name.toLowerCase()
    );

    // Calcola i conteggi per status
    const running = plantMachines.filter(m => m.status === MachineStatuses.Operational).length;
    const idle = plantMachines.filter(m => m.status === MachineStatuses.Idle).length;
    const alarm = plantMachines.filter(m => m.status === MachineStatuses.Alarm).length;

    return {
      ...plant,
      running,
      idle,
      alarm,
      totalMachines: plantMachines.length
    };
  });

  return (
    <div className="rounded-2xl bg-zinc-800 overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={1}
        style={{ height: "256px", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {plantsWithRealData.map((p) => (
          <CircleMarker
            key={p.name}
            center={p.position}
            radius={12}
            pathOptions={{
              fill: true,
              color: "#14b8a6",
              weight: 3,
              fillColor: "#14b8a6",
              fillOpacity: 0.7,
            }}
          >
            <MapTooltip>
              <div className="text-sm text-gray-900">
                <strong className="block mb-1">{p.name}</strong>
                <div className="text-xs text-gray-600 mb-1">
                  Total machines: {p.totalMachines}
                </div>
                <div>
                  Running: <span className="text-green-600">{p.running}</span>
                </div>
                <div>
                  Idle: <span className="text-yellow-600">{p.idle}</span>
                </div>
                <div>
                  Alarm: <span className="text-red-600">{p.alarm}</span>
                </div>
              </div>
            </MapTooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function EventLogTable({ orders = [], customers = [] }) {
  // Convert orders to event log format
  const orderEvents = orders.slice(0, 5).map((order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    const customerName = customer
      ? customer.name
      : `Customer ${order.customerId}`;
    return {
      severity: "Info",
      time: new Date(order.orderDate).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      plant: customerName,
      message: `Order #${order.id} - ${
        order.quantityMachines
      } machines`,
    };
  });

  const displayEvents = orderEvents.length > 0 ? orderEvents : events;

  return (
    <div className="rounded-2xl bg-zinc-800 p-4 overflow-auto">
      <h2 className="text-zinc-100 text-lg mb-2">Recent Orders</h2>
      <table className="w-full text-left text-sm">
        <thead className="uppercase text-zinc-400 border-b border-zinc-700">
          <tr>
            <th className="py-2">Severity</th>
            <th className="py-2">Time</th>
            <th className="py-2">Plant</th>
            <th className="py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {displayEvents.map((e, i) => (
            <tr
              key={i}
              className="border-b border-zinc-700 hover:bg-zinc-700/30"
            >
              <td className="py-2 font-medium text-zinc-200">{e.severity}</td>
              <td className="py-2 text-zinc-300">{e.time}</td>
              <td className="py-2 text-zinc-300">{e.plant}</td>
              <td className="py-2 text-zinc-300">{e.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Component Status factory
 */
const StatusFactory = () => {
  const navigate = useNavigate();
  const { statusMachines } = useStatusMachines();

  // Raggruppa le macchine per factory se i dati hanno questa struttura
  const factoriesWithRealData = factory.map(f => {
    // Filtra le macchine reali per questa factory basandosi sul campo location
    const realMachines = statusMachines.filter(machine => 
      machine.location && machine.location.toLowerCase() === f.name.toLowerCase()
    );
    
    // Crea sempre 4 macchine: usa i dati reali nei primi slot, poi riempi con "offline"
    const machines = Array.from({ length: 4 }, (_, index) => {
      // Se c'è una macchina reale per questo slot, usala
      if (realMachines[index]) {
        return realMachines[index];
      } else {
        // Altrimenti crea una macchina offline
        return {
          id: `${f.name.toLowerCase()}_machine_${index + 1}`,
          name: `Macchina ${index + 1}`,
          status: getStatusEnum('offline')
        };
      }
    });
    
    return {
      ...f,
      machines: machines
    };
  });

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex flex-col">
      <div>
        <p className="text-white text-lg mb-2">Status Factory</p>
        {statusMachines.length > 0 ? (
          <p className="text-teal-400 text-sm mb-2">
            🟢 WebSocket connesso - {statusMachines.length} macchine monitorate
          </p>
        ) : (
          <p className="text-yellow-400 text-sm mb-2">
            🟡 In attesa di dati WebSocket...
          </p>
        )}
      </div>
      <div className="flex">
        {factoriesWithRealData.map(f => {
          const runningCount = f.machines.filter(m => m.status === MachineStatuses.Operational).length;
          const errorCount = f.machines.filter(m => m.status === MachineStatuses.Alarm).length;
          const idleCount = f.machines.filter(m => m.status === MachineStatuses.Idle).length;
          const pendingCount = f.machines.filter(m => m.status === MachineStatuses.Offline).length;
          
          return (
            <div 
              key={f.id}
              onClick={() => navigate(`status/${f.id}`)} 
              className="bg-zinc-900 p-2 m-1 rounded hover:bg-teal-800 cursor-pointer"
            >
              <p className="text-2xl opacity-55 text-center">{f.name.toUpperCase()}</p>
              
              {/* Statistiche rapide */}
              <div className="text-xs text-center mb-2 text-zinc-400">
                🟢 {runningCount} | 🟡 {idleCount} | 🔴 {errorCount}
                {pendingCount > 0 && ` | ⏳ ${pendingCount}`}
              </div>
              
              <div className="flex flex-wrap">
                {f.machines.map((m, index) => {
                  return (
                    <div 
                      key={m.id || index}
                      className={`w-10 h-10 m-1 rounded ${getStatusColor(m.status)}`}
                      title={`${m.name || `Macchina ${index + 1}`} - ${m.status}${m.error ? `: ${m.error}` : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function RealTimeMachineChart() {
  const { statusMachines } = useStatusMachines();

  // Calcola le macchine attive per ogni factory
  const calculateMachineData = () => {
    const currentTime = new Date().toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const italy = statusMachines.filter(m => 
      m.location && m.location.toLowerCase() === 'italy' && m.status === MachineStatuses.Operational
    ).length;

    const brazil = statusMachines.filter(m => 
      m.location && m.location.toLowerCase() === 'brazil' && m.status === MachineStatuses.Operational
    ).length;

    const vietnam = statusMachines.filter(m => 
      m.location && m.location.toLowerCase() === 'vietnam' && m.status === MachineStatuses.Operational
    ).length;

    return {
      time: currentTime,
      Italy: italy,
      Brazil: brazil,
      Vietnam: vietnam,
      timestamp: new Date().getTime()
    };
  };

  // Stato locale per i dati del grafico
  const [machineData, setMachineData] = useState([calculateMachineData()]);

  // Aggiorna i dati quando cambiano le macchine
  useEffect(() => {
    const newData = calculateMachineData();
    
    setMachineData(prevData => {
      // Evita di aggiungere lo stesso punto se non ci sono cambiamenti
      const lastPoint = prevData[prevData.length - 1];
      if (lastPoint && 
          lastPoint.Italy === newData.Italy && 
          lastPoint.Brazil === newData.Brazil && 
          lastPoint.Vietnam === newData.Vietnam) {
        return prevData;
      }
      
      // Mantieni solo gli ultimi 15 punti dati
      const updatedData = [...prevData, newData].slice(-15);
      return updatedData;
    });
  }, [statusMachines]);

  return (
    <div className="rounded-2xl bg-zinc-800 p-4">
      <h2 className="text-zinc-100 text-lg mb-2">Macchine Attive Real-Time</h2>
      <div className="text-xs text-zinc-400 mb-3">
        🇮🇹 Italy: {machineData[machineData.length - 1]?.Italy || 0} | 
        🇧🇷 Brazil: {machineData[machineData.length - 1]?.Brazil || 0} | 
        🇻🇳 Vietnam: {machineData[machineData.length - 1]?.Vietnam || 0}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={machineData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="italyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="brazilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vietnamGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} />
          <YAxis stroke="#a1a1aa" fontSize={10} domain={[0, 4]} />
          <ChartTooltip 
            cursor={{ stroke: "#4b5563", strokeWidth: 1 }}
            labelStyle={{ color: "#000" }}
            contentStyle={{ 
              backgroundColor: "#27272a", 
              border: "1px solid #52525b", 
              borderRadius: "8px",
              color: "#f4f4f5"
            }}
          />
          <Area
            type="stepAfter"
            dataKey="Italy"
            stroke="#10b981"
            fill="url(#italyGradient)"
            strokeWidth={2}
            name="🇮🇹 Italy"
          />
          <Area
            type="stepAfter"
            dataKey="Brazil"
            stroke="#3b82f6"
            fill="url(#brazilGradient)"
            strokeWidth={2}
            name="🇧🇷 Brazil"
          />
          <Area
            type="stepAfter"
            dataKey="Vietnam"
            stroke="#f59e0b"
            fill="url(#vietnamGradient)"
            strokeWidth={2}
            name="🇻🇳 Vietnam"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );1
}

// ──────────────────────────────────────────────────────────────────────────────
//  MAIN DASHBOARD
// ──────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState(kpiDefault);
  const navigate = useNavigate();
  
  // Utilizzo l'hook per accedere agli stati delle macchine
  const { statusMachines, setStatusMachines } = useStatusMachines();
  
  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getCustomers();
      console.log("Fetched customers data:", data);

      // Check if data is wrapped in a response object
      const customersList = Array.isArray(data)
        ? data
        : data?.data
        ? data.data
        : data?.customers
        ? data.customers
        : [];

      setCustomers(customersList);
    } catch (error) {
      message.error("Failed to fetch customers: " + error.message);
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders();
      
      setOrders(data);

      // Update KPIs based on orders
      if (data && data.length > 0) {
        setKpi((prev) => ({
          ...prev,

           activeOrders: data.filter(order => !order.fullfilledDate).length,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch orders: " + error.message);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log("Status machines aggiornate:", statusMachines);
    
    // Aggiorna i KPI basati sui dati delle macchine
    if (statusMachines && statusMachines.length > 0) {
      const runningMachines = statusMachines.filter(m => m.status === MachineStatuses.Operational).length;
      const errorMachines = statusMachines.filter(m => m.status === MachineStatuses.Alarm).length;
      const pendingMachines = statusMachines.filter(m => m.status === MachineStatuses.Offline).length;

      setKpi(prev => ({
        ...prev,
        alarms: errorMachines,
        activeOrders: orders.filter(order => !order.fullfilledDate).length,
      }));
    }
  }, [statusMachines, orders]);



  return (
    <Spin spinning={loading} tip="Loading dashboard data...">
      <div className="bg-zinc-900 text-zinc-100 p-4 lg:p-6 h-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          <KPI icon={Layers} label="Ordini Attivi" value={kpi.activeOrders} />
          <KPI icon={Bell} label="Open Alarms" value={kpi.alarms} />
        </div>

        {/* Production Chart and status factory*/}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mb-6">

          <StatusFactory />
        </div>

        {/* Real-time Chart + Map + Event Log */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <RealTimeMachineChart />
          <PlantMap />
          <EventLogTable orders={orders} />
        </div>

        {/* Real-time Machine Status */}
        <div className="grid grid-cols-1 gap-4">
          <RealTimeMachineStatus />
        </div>
      </div>
    </Spin>
  );
}
