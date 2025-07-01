import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Card,
    Space,
    Typography,
    Divider,
    Select,
    Row,
    Col,
    Empty,
    notification,
    Spin
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    InboxOutlined,
    BuildOutlined,
    CalendarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './CreateNewOrder.css';
import { SignalRContext } from '../../contexts/signalRContext';
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateNewOrder = () => {
    const { API_BASE_URL } = useContext(SignalRContext);
    const [industrialFacilities, setIndustrialFacilities] = useState([]);
    const [customers, setCustomers] = useState([]);
    const fetchCustomers = async () => {
        
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setCustomers(await response.json());
    }

    const fetchIndustrialFacilities = async () => {
       
        const response = await fetch(`${API_BASE_URL}/api/industrialFacilities`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },

        });

        setIndustrialFacilities(await response.json());
    }

    useEffect(() => {
        fetchIndustrialFacilities();
        fetchCustomers();
    }, [])



    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    const [lots, setLots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addLot = () => {
        const newLot = {
            id: Date.now(),
            name: '',
            quantity: 1,
            description: '',
            status: 'pending'
        };
        setLots(prev => [...prev, newLot]);
    };

    const removeLot = (lotId) => {
        setLots(prev => prev.filter(lot => lot.id !== lotId));
    };

    const updateLot = (lotId, field, value) => {
        console.log(`Updating lot ${lotId} field ${field} with value:`, value);
        setLots(prev => prev.map(lot =>
            lot.id === lotId ? { ...lot, [field]: value } : lot
        ));

    };

    const onFinish = async (values) => {
        setIsSubmitting(true);

        try {
            // Validazione per assicurarsi che ci sia almeno un lotto
            if (lots.length === 0) {
                api.error({
                    message: 'Errore di Validazione',
                    description: 'Devi aggiungere almeno un lotto prima di creare l\'ordine',
                    duration: 4,
                });
                setIsSubmitting(false);
                return;
            }


            // Prepara il DTO secondo OrderWithLotsCreateDto
            const orderDto = {
                customerId: values.customerId,
                quantityMachines: values.quantityMachines,
                orderDate: values.orderDate ? values.orderDate.toISOString() : new Date().toISOString(),
                deadline: values.deadline ? values.deadline.toISOString() : null,
                lots: lots.map(lot => ({
                    totalQuantity: parseInt(lot.totalQuantity),
                    startDate: new Date().toISOString(),
                    industrialFacilityId: lot.industrialFacilityId
                }))
            };

            console.log('Order DTO to submit:', orderDto);
            
            const response = await fetch(`${API_BASE_URL}/api/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDto)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Server error: ${response.status} ${response.statusText}`);
            }


            console.log('Order created successfully:');

            api.success({
                message: 'Successo',
                description: 'Ordine creato con successo!',
                duration: 3,
            });



        } catch (error) {
            console.error('Error creating order:', error);
            api.error({
                message: 'Errore',
                description: error.message || 'Errore durante la creazione dell\'ordine',
                duration: 4,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-zinc-900 min-h-screen">
            {contextHolder}
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/orders')}
                        size="large"
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600"
                    />
                    <h1 className="text-3xl font-bold text-white m-0">
                        Crea Nuovo Ordine
                    </h1>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        orderDate: dayjs(),
                        quantityMachines: 1,
                        customerId: 1
                    }}
                    className="space-y-6"
                >
                    {/* Order Information Card */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-6">
                            <InboxOutlined className="text-white text-xl" />
                            <h2 className="text-xl font-semibold text-white m-0">Informazioni Ordine</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Form.Item
                                    label={<span className="text-zinc-300">Nome Ordine</span>}
                                    name="name"
                                    rules={[{ required: true, message: 'Il nome dell\'ordine è obbligatorio' }]}
                                >
                                    <Input
                                        placeholder="Inserisci il nome dell'ordine"
                                        size="large"
                                        className="dark-input"
                                    />
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item
                                    label={<span className="text-zinc-300">Customer</span>}
                                    name="customerId"
                                    rules={[{ required: true, message: 'Il Customer è obbligatorio' }]}
                                >
                                    <Select
                                        size='large'
                                        placeholder="ID Cliente"
                                        className="w-full dark-select"
                                        
                                        >
                                        {customers.map((i) => (
                                            <Option key={i.id} value={i.id}>
                                                {i.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item
                                    label={<span className="text-zinc-300">Quantità Macchine</span>}
                                    name="quantityMachines"
                                    rules={[{ required: true, message: 'La quantità macchine è obbligatoria' }]}
                                >
                                    <InputNumber
                                        placeholder="Numero macchine"
                                        min={1}
                                        size="large"
                                        className="w-full dark-input-number"
                                    />
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item
                                    label={<span className="text-zinc-300">Data Ordine</span>}
                                    name="orderDate"
                                    rules={[{ required: true, message: 'La data ordine è obbligatoria' }]}
                                >
                                    <DatePicker
                                        placeholder="Data ordine"
                                        size="large"
                                        className="w-full dark-datepicker"
                                        suffixIcon={<CalendarOutlined className="text-zinc-400" />}
                                    />
                                </Form.Item>
                            </div>

                            <div>
                                <Form.Item
                                    label={<span className="text-zinc-300">Scadenza <span className="text-zinc-500 text-xs">(opzionale)</span></span>}
                                    name="deadline"
                                    required={false}
                                >
                                    <DatePicker
                                        placeholder="Scadenza (opzionale)"
                                        size="large"
                                        className="w-full dark-datepicker"
                                        suffixIcon={<ClockCircleOutlined className="text-zinc-400" />}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Lots Section */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <InboxOutlined className="text-white text-xl" />
                                <h2 className="text-xl font-semibold text-white m-0">Lotti ({lots.length})</h2>
                            </div>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addLot}
                                className="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                            >
                                Aggiungi Lotto
                            </Button>
                        </div>

                        {lots.length === 0 ? (
                            <div className="text-center py-12">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span className="text-zinc-400">Nessun lotto aggiunto. Clicca 'Aggiungi Lotto' per iniziare.</span>}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lots.map((lot, index) => (
                                    <div key={lot.id} className="bg-zinc-700 rounded-lg p-4 border border-zinc-600">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-white">
                                                Lotto #{index + 1}
                                            </h3>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeLot(lot.id)}
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Quantità Totale <span className="text-red-500">*</span>
                                                </label>
                                                <InputNumber
                                                    placeholder="20"
                                                    value={lot.totalQuantity}
                                                    onChange={(e) => updateLot(lot.id, 'totalQuantity', e)}
                                                    className=""
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                                    Industria <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    placeholder="Seleziona Industria"
                                                    value={lot.industrialFacilityId}
                                                    onChange={(value) => updateLot(lot.id, 'industrialFacilityId', value)}
                                                    className="w-full dark-select">
                                                    {industrialFacilities.map((i) => (
                                                        <Option key={i.id} value={i.id}>
                                                            {i.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                        <div className="flex justify-end gap-4">
                            <Button
                                size="large"
                                onClick={() => navigate('/orders')}
                                className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600 hover:border-zinc-500"
                            >
                                Annulla
                            </Button>
                            <Form.Item className="m-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={isSubmitting}
                                    className="bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
                                >
                                    {isSubmitting ? 'Creazione...' : 'Crea Ordine'}
                                </Button>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default CreateNewOrder;