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

    };

    const sendReloadMachine = (name, id, status) => () => {
        if (status === "error") {
            showRestartMessage(name);
        } else {
            showOkMessage(name, id);
        }

    }

    return (
        <div className="bg-zinc-900 w-screen">
            <div className="m-3 rounded-lg">
                <h1 className="text-white text-2xl m-2 font-semibold">{selectedFactory ? selectedFactory.name.toUpperCase() : "Factory not found"}</h1>
                <div className="grid grid-cols-2 gap-4">
                    {contextHolder}
                    {selectedFactory.machines.map((m, index) => {
                        return (
                            <div>
                                <div onClick={sendReloadMachine(m.name, m.id, m.status)} className={`w-50 h-50 m-2 hover:shadow-white hover:shadow-sm transition-all 1s rounded-xl border-5 flex items-center justify-center border-gray-700  ${m.status == "error" ? "bg-red-500" : m.status == "running" ? "bg-green-400" : "bg-gray-500"}`}>
                                    {m.status === "error" ? (<PlayCircle size={100} className="text-gray-300 text-center  " />) : null}
                                </div>
                                <div className="ml-2">
                                    <h2 className="text-white text-lg font-semibold">{m.name}</h2>
                                    <p className="text-white text-sm">Status: {m.status}</p>
                                    <p className="text-white text-sm">Messaggi: {m.message}</p>
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