import { useState } from 'react';
import { useStatusMachines } from '../hooks/useStatusMachines';
import { MachineStatuses, getStatusEnum, getStatusString } from '../services/statusParser';

export default function WebSocketTester() {
  const { statusMachines, setStatusMachines } = useStatusMachines();
  const [testMachine, setTestMachine] = useState({
    name: "Test-CNC-01",
    status: getStatusEnum("running"),
    error: ""
  });

  // Simula l'arrivo di dati WebSocket
  const simulateWebSocketData = () => {
    const mockData = {
      id: testMachine.name,
      name: testMachine.name,
      status: testMachine.status,
      factoryId: 1,
      error: testMachine.error || null,
      timestamp: new Date().toISOString()
    };

    // Simula l'aggiornamento come se arrivasse dalla WebSocket
    setStatusMachines(prevMachines => {
      const updatedMachines = [...prevMachines];
      const existingIndex = updatedMachines.findIndex(
        machine => machine.id === mockData.id || machine.name === mockData.name
      );
      
      if (existingIndex !== -1) {
        updatedMachines[existingIndex] = { ...updatedMachines[existingIndex], ...mockData };
      } else {
        updatedMachines.push(mockData);
      }
      
      return updatedMachines;
    });
  };

  const presetTests = [
    // Factory 1 - Italy
    {
      name: "CNC-01",
      status: getStatusEnum("running"),
      error: null
    },
    {
      name: "CNC-02",
      status: getStatusEnum("error"),
      error: "Temperatura troppo alta (95°C)"
    },
    {
      name: "CNC-03",
      status: getStatusEnum("idle"),
      error: null
    },
    {
      name: "CNC-04",
      status: getStatusEnum("error"),
      error: "Vibrazione anomala rilevata"
    },
    // Factory 2 - Vietnam
    {
      name: "LATHE-01",
      status: getStatusEnum("running"),
      error: null
    },
    {
      name: "LATHE-02",
      status: getStatusEnum("idle"),
      error: null
    },
    // Factory 3 - Brasil
    {
      name: "MILL-01",
      status: getStatusEnum("running"),
      error: null
    },
    {
      name: "MILL-02",
      status: getStatusEnum("error"),
      error: "Manutenzione richiesta"
    }
  ];

  const runPresetTest = (preset) => {
    const mockData = {
      id: preset.name,
      name: preset.name,
      status: preset.status,
      factoryId: Math.floor(Math.random() * 3) + 1,
      error: preset.error,
      timestamp: new Date().toISOString()
    };

    setStatusMachines(prevMachines => {
      const updatedMachines = [...prevMachines];
      const existingIndex = updatedMachines.findIndex(
        machine => machine.id === mockData.id || machine.name === mockData.name
      );
      
      if (existingIndex !== -1) {
        updatedMachines[existingIndex] = { ...updatedMachines[existingIndex], ...mockData };
      } else {
        updatedMachines.push(mockData);
      }
      
      return updatedMachines;
    });
  };

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
      <h3 className="text-white text-lg mb-4">🧪 WebSocket Tester</h3>
      
      {/* Form manuale */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nome macchina"
          value={testMachine.name}
          onChange={(e) => setTestMachine(prev => ({ ...prev, name: e.target.value }))}
          className="bg-zinc-700 text-white p-2 rounded"
        />
        
        <select
          value={testMachine.status}
          onChange={(e) => setTestMachine(prev => ({ ...prev, status: parseInt(e.target.value) }))}
          className="bg-zinc-700 text-white p-2 rounded"
        >
          <option value={MachineStatuses.Operational}>Operational</option>
          <option value={MachineStatuses.Idle}>Idle</option>
          <option value={MachineStatuses.Alarm}>Alarm</option>
          <option value={MachineStatuses.Maintenance}>Maintenance</option>
          <option value={MachineStatuses.Offline}>Offline</option>
        </select>
        
        <input
          type="text"
          placeholder="Messaggio errore (opzionale)"
          value={testMachine.error}
          onChange={(e) => setTestMachine(prev => ({ ...prev, error: e.target.value }))}
          className="bg-zinc-700 text-white p-2 rounded"
          disabled={testMachine.status !== MachineStatuses.Alarm}
        />
        
        <button
          onClick={simulateWebSocketData}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-medium"
        >
          Invia Test
        </button>
      </div>

      {/* Test preset */}
      <div className="mb-4">
        <h4 className="text-zinc-300 text-sm mb-2">Test rapidi:</h4>
        <div className="flex flex-wrap gap-2">
          {presetTests.map((preset, index) => (
            <button
              key={index}
              onClick={() => runPresetTest(preset)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                preset.status === MachineStatuses.Operational ? 'bg-green-600 hover:bg-green-700' :
                preset.status === MachineStatuses.Alarm ? 'bg-red-600 hover:bg-red-700' :
                preset.status === MachineStatuses.Idle ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {preset.name} - {getStatusString(preset.status)}
            </button>
          ))}
        </div>
      </div>

      {/* Stato attuale */}
      <div>
        <h4 className="text-zinc-300 text-sm mb-2">Macchine attualmente monitorate: {statusMachines.length}</h4>
        <div className="text-xs text-zinc-400 max-h-20 overflow-y-auto">
          {statusMachines.map(machine => (
            <div key={machine.id} className="mb-1">
              {machine.name}: <span className={
                machine.status === MachineStatuses.Operational ? 'text-green-400' :
                machine.status === MachineStatuses.Alarm ? 'text-red-400' :
                machine.status === MachineStatuses.Idle ? 'text-blue-400' :
                'text-orange-400'
              }>{getStatusString(machine.status)}</span>
              {machine.error && <span className="text-red-300"> - {machine.error}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
