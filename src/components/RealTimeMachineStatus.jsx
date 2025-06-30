import { useEffect } from 'react';
import { useStatusMachines } from '../hooks/useStatusMachines';
import { MachineStatuses, getStatusString } from '../services/statusParser';

export default function RealTimeMachineStatus() {
  const { statusMachines } = useStatusMachines();

  if (!statusMachines || statusMachines.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-2xl p-4">
        <h3 className="text-white text-lg mb-2">Stato Macchine Real-time</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-zinc-400">In attesa di dati SignalR...</span>
        </div>
      </div>
    );
  }

  const runningMachines = statusMachines.filter(m => m.status === MachineStatuses.Operational);
  const idleMachines = statusMachines.filter(m => m.status === MachineStatuses.Idle);
  const errorMachines = statusMachines.filter(m => m.status === MachineStatuses.Alarm);
  const pendingMachines = statusMachines.filter(m => m.status === MachineStatuses.Offline);

  return (
    <div className="bg-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg">Stato Macchine Real-time</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            pendingMachines.length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className={`text-sm ${
            pendingMachines.length > 0 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {pendingMachines.length > 0 ? 'Pending' : 'Live'}
          </span>
        </div>
      </div>

      {/* Statistiche generali */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{statusMachines.length}</div>
          <div className="text-sm text-zinc-400">Totale</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{runningMachines.length}</div>
          <div className="text-sm text-zinc-400">Running</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{idleMachines.length}</div>
          <div className="text-sm text-zinc-400">Idle</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{errorMachines.length}</div>
          <div className="text-sm text-zinc-400">Error</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{pendingMachines.length}</div>
          <div className="text-sm text-zinc-400">Pending</div>
        </div>
      </div>

      {/* Lista macchine */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {statusMachines.map((machine, index) => {
          const machineKey = machine.machine_id || machine.machine || machine.id || machine.name || `machine-${index}`;
          const machineName = machine.name || machine.machine || machine.id || `Macchina ${index + 1}`;
          const machineError = machine.tool_alarms || machine.error || machine.errormessage;
          const machineTimestamp = machine.timestamp || machine.lastUpdate;
          
          return (
            <div 
              key={machineKey} 
              className="flex flex-col p-2 bg-zinc-700 rounded"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      machine.status === MachineStatuses.Operational ? 'bg-green-500' :
                      machine.status === MachineStatuses.Idle ? 'bg-blue-500' :
                      machine.status === MachineStatuses.Alarm ? 'bg-red-500' :
                      machine.status === MachineStatuses.Maintenance ? 'bg-yellow-500' :
                      'bg-gray-500 animate-pulse'
                    }`}
                  />
                  <span className="text-white font-medium">
                    {machineName}
                  </span>
                  {machine.location && (
                    <span className="text-zinc-400 text-sm">({machine.location})</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {machine.temperature && (
                    <span className="text-zinc-300 text-sm">
                      {machine.temperature}°C
                    </span>
                  )}
                  {machine.productivity && (
                    <span className="text-zinc-300 text-sm">
                      {machine.productivity}%
                    </span>
                  )}
                  {machineTimestamp && (
                    <span className="text-zinc-400 text-xs">
                      {new Date(machineTimestamp).toLocaleTimeString('it-IT')}
                    </span>
                  )}
                  <span 
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      machine.status === MachineStatuses.Operational ? 'bg-green-500/20 text-green-400' :
                      machine.status === MachineStatuses.Idle ? 'bg-blue-500/20 text-blue-400' :
                      machine.status === MachineStatuses.Alarm ? 'bg-red-500/20 text-red-400' :
                      machine.status === MachineStatuses.Maintenance ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {getStatusString(machine.status)}
                  </span>
                </div>
              </div>
              
              {/* Mostra errore se presente */}
              {machineError && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
                  <span className="font-medium">Errore: </span>
                  {machineError}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
