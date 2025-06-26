import React, { useEffect } from 'react';
import { useStatusMachines } from '../hooks/useStatusMachines';

export default function MachineStatusList() {
  // Utilizzo l'hook per accedere al contesto
  const { statusMachines, setStatusMachines } = useStatusMachines();


  // Funzione per aggiornare lo stato di una singola macchina
  const updateMachineStatus = (machineId, newStatus) => {
    console.log(newStatus);
    setStatusMachines(prevMachines => 
      prevMachines.map(machine => 
        machine.machine_id === machineId 
          ? { ...machine, status : newStatus }
          : machine
      )
    );
  };

  // Funzione per aggiungere una nuova macchina
  const addMachine = () => {
    const newMachine = {
      id: Date.now(), // ID temporaneo
      name: `Macchina ${statusMachines.length + 1}`,
      status: 'idle',
      temperature: Math.floor(Math.random() * 100)
    };
    
    setStatusMachines(prevMachines => [...prevMachines, newMachine]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Status Macchine</h2>
        <button 
          onClick={addMachine}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Aggiungi Macchina
        </button>
      </div>

      {statusMachines.length === 0 ? (
        <p className="text-gray-500">Nessuna macchina trovata</p>
      ) : (
        <div className="space-y-3">
          {statusMachines.map(machine => (
            <div 
              key={machine.machine_id} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{machine.name}</h3>
                <p className="text-sm text-gray-600">
                  Temperatura: {machine.temperature}°C
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span 
                  className={`px-2 py-1 rounded text-sm ${
                    machine.status === 'running' ? 'bg-green-100 text-green-800' :
                    machine.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {machine.status}
                </span>
                
                <select 
                  value={machine.status}
                  onChange={(e) => updateMachineStatus(machine.id, e.target.value)}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="running">Running</option>
                  <option value="idle">Idle</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
