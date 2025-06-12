import { notification } from "antd";
import { CheckCircle, PlayCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";

const StatusFactory = () => {
    const { idFactory } = useParams();
    const factory =
        [
            {
                id: 1,
                name: "Italy",
                machines: [
                    {
                        id: 0,
                        name: "Macchina CNC2",
                        status: "error",
                        message: "Errore di connessione"
                    },
                    {
                        id: 1,
                        name: "Macchina CNC3",
                        status: "error",
                        message: "Errore di connessione"
                    },
                    {
                        id: 2,
                        name: "Macchina CNC4",
                        status: "error",
                        message: "Errore di connessione"
                    },
                    {
                        id: 3,
                        name: "Macchina CNC4",
                        status: "idle",
                        message: ""
                    }
                ]
            },
            {
                id: 2,
                name: "Vietnam",
                machines: [
                    {
                        id: 0,
                        name: "Macchina CNC2",
                        status: "running",
                        message: ""
                    },
                    {
                        id: 1,
                        name: "Macchina CNC3",
                        status: "idle",
                        message: ""
                    },
                    {
                        id: 2,
                        name: "Macchina CNC4",
                        status: "running",
                        message: ""
                    },
                    {
                        id: 3,
                        name: "Macchina CNC4",
                        status: "error",
                        message: "Errore di connessione"
                    }
                ]
            },
            {
                id: 3,
                name: "Brasil",
                machines: [
                    {
                        id: 0,
                        name: "Macchina CNC2",
                        status: "running",
                        message: ""
                    },
                    {
                        id: 1,
                        name: "Macchina CNC3",
                        status: "idle",
                        message: ""
                    },
                    {
                        id: 2,
                        name: "Macchina CNC4",
                        status: "running",
                        message: ""
                    },
                    {
                        id: 3,
                        name: "Macchina CNC4",
                        status: "error",
                        message: "Errore di connessione"
                    }
                ]
            }
        ]
    const [factorydb, setFactorydb] = useState(factory);
    const selectedFactory = factory.find(f => f.id === Number(idFactory));
    const [api, contextHolder] = notification.useNotification();

    const showRestartMessage = (name, id) => {
        api.open({
            message: 'Restart Machine ' + name,
            icon: <PlayCircle size={24} className="text-black" />,
            description:
                'The manutenance team is working to resolve the issue. Please wait.',
            duration: 3,
            showProgress: true,
        });

    };

    const showOkMessage = (name) => {
        api.open({
            message: 'This Machine ' + name,
            icon: <CheckCircle size={24} className="text-black" />,
            description:
                'This machine is running correctly.',
            duration: 3,
            showProgress: true,
        });

    };    const sendReloadMachine = (name, id, status) => () => {
        if (status === "error") {
            showRestartMessage(name);
        } else {
            showOkMessage(name, id);
        }
    };return (
        <div className="bg-zinc-900 min-h-screen w-full px-4 py-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-white text-xl sm:text-2xl lg:text-3xl mb-6 font-semibold text-center">
                    {selectedFactory ? selectedFactory.name.toUpperCase() : "Factory not found"}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {contextHolder}
                    {selectedFactory.machines.map((m, index) => {
                        return (
                            <div key={m.id} className="bg-zinc-800 rounded-xl p-4 hover:bg-zinc-700 transition-all duration-300">
                                <div 
                                    onClick={sendReloadMachine(m.name, m.id, m.status)} 
                                    className={`w-full aspect-square mb-4 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 rounded-xl border-2 border-zinc-600 flex items-center justify-center cursor-pointer ${
                                        m.status === "error" ? "bg-red-500 hover:bg-red-400" : 
                                        m.status === "running" ? "bg-green-400 hover:bg-green-300" : 
                                        "bg-gray-500 hover:bg-gray-400"
                                    }`}
                                >
                                    {m.status === "error" ? (
                                        <PlayCircle size={60} className="text-gray-100 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-zinc-100 text-base sm:text-lg font-semibold truncate">{m.name}</h2>
                                    <p className="text-zinc-300 text-sm">
                                        <span className="font-medium">Status:</span> 
                                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            m.status === "error" ? "bg-red-500/20 text-red-300" :
                                            m.status === "running" ? "bg-green-500/20 text-green-300" :
                                            "bg-gray-500/20 text-gray-300"
                                        }`}>
                                            {m.status}
                                        </span>
                                    </p>
                                    {m.message && (
                                        <p className="text-zinc-400 text-xs sm:text-sm">
                                            <span className="font-medium">Message:</span> {m.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default StatusFactory;