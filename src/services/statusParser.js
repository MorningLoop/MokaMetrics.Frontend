export const MachineStatuses = Object.freeze({
    "Operational": 1,
    "Maintenance": 2,
    "Alarm" : 3,
    "Offline" : 4,
    "Idle" : 5,
});

// Mapping da stringhe a enum
export const StatusStringToEnum = Object.freeze({
    "running": MachineStatuses.Operational,
    "operational": MachineStatuses.Operational,
    "maintenance": MachineStatuses.Maintenance,
    "alarm": MachineStatuses.Alarm,
    "error": MachineStatuses.Alarm,
    "offline": MachineStatuses.Offline,
    "pending": MachineStatuses.Offline,
    "idle": MachineStatuses.Idle,
});

// Mapping da enum a stringhe per display
export const StatusEnumToString = Object.freeze({
    [MachineStatuses.Operational]: "Operational",
    [MachineStatuses.Maintenance]: "Maintenance", 
    [MachineStatuses.Alarm]: "Alarm",
    [MachineStatuses.Offline]: "Offline",
    [MachineStatuses.Idle]: "Idle",
});

// Funzioni helper
export const getStatusEnum = (statusInput) => {
    // Se è già un numero (enum), verificiamo che sia valido
    if (typeof statusInput === 'number') {
        const validValues = Object.values(MachineStatuses);
        return validValues.includes(statusInput) ? statusInput : MachineStatuses.Offline;
    }
    
    // Se è una stringa, convertiamo come prima
    if (typeof statusInput === 'string') {
        const lowercaseStatus = statusInput.toLowerCase();
        return StatusStringToEnum[lowercaseStatus] || MachineStatuses.Offline;
    }
    
    // Default fallback
    return MachineStatuses.Offline;
};

export const getStatusString = (statusEnum) => {
    return StatusEnumToString[statusEnum] || "Unknown";
};

export const getStatusColor = (statusEnum) => {
    switch (statusEnum) {
        case MachineStatuses.Operational:
            return "bg-green-500";
        case MachineStatuses.Maintenance:
            return "bg-yellow-500";
        case MachineStatuses.Alarm:
            return "bg-red-500";
        case MachineStatuses.Offline:
            return "bg-gray-500";
        case MachineStatuses.Idle:
            return "bg-blue-500";
        default:
            return "bg-gray-500";
    }
};

export const getStatusTextColor = (statusEnum) => {
    switch (statusEnum) {
        case MachineStatuses.Operational:
            return "text-green-300";
        case MachineStatuses.Maintenance:
            return "text-yellow-300";
        case MachineStatuses.Alarm:
            return "text-red-300";
        case MachineStatuses.Offline:
            return "text-gray-300";
        case MachineStatuses.Idle:
            return "text-blue-300";
        default:
            return "text-gray-300";
    }
};
