import { notification } from "antd";
import { CheckCircle, PlayCircle, Circle, Loader2, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useStatusMachines } from "../hooks/useStatusMachines";
import { MachineStatuses, getStatusEnum, getStatusString, getStatusColor, getStatusTextColor } from "../services/statusParser";

const StatusFactory = () => {
    const { idFactory } = useParams();
    
    // Utilizzo del contesto per i dati WebSocket
    const { statusMachines } = useStatusMachines();
    
    // Trova la factory corrente e le sue macchine
    const currentFactory = statusMachines.filter(machine => 
        machine.factoryId === parseInt(idFactory)
    );
    
    // Nomi delle factory
    const factoryNames = {
        1: "Italy",
        2: "Vietnam", 
        3: "Brasil"
    };
    
    const factoryName = factoryNames[parseInt(idFactory)] || `Factory ${idFactory}`;
    
    // Se non ci sono macchine dal WebSocket, usa dati di fallback
    const defaultMachines = {
        1: [
            { machineId: "CNC-01", factoryId: 1, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "CNC-02", factoryId: 1, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "CNC-03", factoryId: 1, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "CNC-04", factoryId: 1, status: getStatusEnum("pending"), timestamp: new Date().toISOString() }
        ],
        2: [
            { machineId: "LATHE-01", factoryId: 2, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "LATHE-02", factoryId: 2, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "LATHE-03", factoryId: 2, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "LATHE-04", factoryId: 2, status: getStatusEnum("pending"), timestamp: new Date().toISOString() }
        ],
        3: [
            { machineId: "MILL-01", factoryId: 3, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "MILL-02", factoryId: 3, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "MILL-03", factoryId: 3, status: getStatusEnum("pending"), timestamp: new Date().toISOString() },
            { machineId: "MILL-04", factoryId: 3, status: getStatusEnum("pending"), timestamp: new Date().toISOString() }
        ]
    };
    
    const machines = currentFactory.length > 0 ? currentFactory : 
                   (defaultMachines[parseInt(idFactory)] || []);
    
    // Statistiche
    const runningCount = machines.filter(m => m.status === MachineStatuses.Operational).length;
    const idleCount = machines.filter(m => m.status === MachineStatuses.Idle).length;
    const errorCount = machines.filter(m => m.status === MachineStatuses.Alarm).length;
    const pendingCount = machines.filter(m => m.status === MachineStatuses.Offline).length;
    
    const [api, contextHolder] = notification.useNotification();

    const showRestartMessage = (machineName) => {
        api.open({
            message: `Restart Machine ${machineName}`,
            icon: <PlayCircle size={24} className="text-blue-600" />,
            description: 'The maintenance team is working to resolve the issue. Please wait.',
            duration: 3,
            showProgress: true,
        });
    };

    const showOkMessage = (machineName) => {
        api.open({
            message: `Machine ${machineName}`,
            icon: <CheckCircle size={24} className="text-green-600" />,
            description: 'This machine is running correctly.',
            duration: 3,
            showProgress: true,
        });
    };

    const handleMachineClick = (machine) => {
        const machineName = machine.machineId || machine.machine || machine.id || machine.name;
        if (machine.status === MachineStatuses.Alarm) {
            showRestartMessage(machineName);
        } else {
            showOkMessage(machineName);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case MachineStatuses.Operational:
                return <CheckCircle size={48} className="text-white" />;
            case MachineStatuses.Idle:
                return <Circle size={48} className="text-white" />;
            case MachineStatuses.Alarm:
                return <AlertTriangle size={48} className="text-white" />;
            case MachineStatuses.Offline:
                return <Loader2 size={48} className="text-white animate-spin" />;
            case MachineStatuses.Maintenance:
                return <PlayCircle size={48} className="text-white" />;
            default:
                return <Circle size={48} className="text-white" />;
        }
    };

    const getStatusColorLocal = (status) => {
        switch (status) {
            case MachineStatuses.Operational:
                return 'bg-green-500 hover:bg-green-400';
            case MachineStatuses.Idle:
                return 'bg-blue-500 hover:bg-blue-400';
            case MachineStatuses.Alarm:
                return 'bg-red-500 hover:bg-red-400';
            case MachineStatuses.Offline:
                return 'bg-gray-500 hover:bg-gray-400';
            case MachineStatuses.Maintenance:
                return 'bg-yellow-500 hover:bg-yellow-400';
            default:
                return 'bg-gray-500 hover:bg-gray-400';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case MachineStatuses.Operational:
                return 'bg-green-500/20 text-green-300';
            case MachineStatuses.Idle:
                return 'bg-blue-500/20 text-blue-300';
            case MachineStatuses.Alarm:
                return 'bg-red-500/20 text-red-300';
            case MachineStatuses.Offline:
                return 'bg-gray-500/20 text-gray-300';
            case MachineStatuses.Maintenance:
                return 'bg-yellow-500/20 text-yellow-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-zinc-900 p-6">
            {contextHolder}
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white text-center mb-4">
                        {factoryName.toUpperCase()} FACTORY
                    </h1>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{runningCount}</div>
                            <div className="text-sm text-gray-400">Running</div>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{idleCount}</div>
                            <div className="text-sm text-gray-400">Idle</div>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
                            <div className="text-sm text-gray-400">Error</div>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-400">{pendingCount}</div>
                            <div className="text-sm text-gray-400">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Machines Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {machines.map((machine, index) => {
                        const machineKey = machine.machineId || machine.machine || machine.id || machine.name || `machine-${index}`;
                        const machineName = machine.machineId || machine.machine || machine.id || machine.name || `Machine ${index + 1}`;
                        const machineError = machine.error || machine.errormessage;
                        const machineTimestamp = machine.timestamp || machine.lastUpdate;
                        
                        return (
                            <div 
                                key={machineKey} 
                                className="bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition-all duration-300"
                            >
                                <div 
                                    onClick={() => handleMachineClick(machine)}
                                    className={`w-full aspect-square mb-4 rounded-xl border-2 border-zinc-600 flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-white/20 ${getStatusColorLocal(machine.status)}`}
                                >
                                    {getStatusIcon(machine.status)}
                                </div>
                                
                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold text-white truncate">
                                        {machineName}
                                    </h2>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Status:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(machine.status)}`}>
                                                {getStatusString(machine.status)}
                                            </span>
                                        </div>
                                        
                                        {machine.location && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Location:</span>
                                                <span className="text-sm text-zinc-300">{machine.location}</span>
                                            </div>
                                        )}
                                        
                                        {machineError && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <p className="text-red-300 text-sm font-medium mb-1">Error:</p>
                                                <p className="text-red-200 text-xs">{machineError}</p>
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-gray-500">
                                            <span>Last Update:</span>
                                            <br />
                                            <span>{formatTimestamp(machineTimestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusFactory;