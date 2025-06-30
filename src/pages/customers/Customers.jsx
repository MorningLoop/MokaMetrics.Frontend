import React, { useEffect, useState } from 'react';
import { Card, Button, Drawer, Form, Input, Modal, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const Customers = () => {
    const [customers, setCustomers] = useState([
    ]); const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal(); const handleEdit = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue(customer);
        setDrawerVisible(true);
    };

    const fetchCustomers = async () => {
        const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL;
        try {
            const response = await fetch(`${apiBaseUrl}/customers`);
            if (!response.ok) {
                throw new Error('Errore durante il recupero dei customers');
            }
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Errore:', error);
            message.error('Impossibile recuperare i customers');
        }
    }

    useEffect(() => {
        fetchCustomers();
    },[])

    const handleAdd = () => {
        setEditingCustomer(null);
        form.resetFields();
        setDrawerVisible(true);
    }; 

    const handleDelete = async(customerId) => {
        console.log('handleDelete chiamata con ID:', customerId);
        modal.confirm({
            title: 'Sei sicuro di voler eliminare questo customer?',
            content: 'Questa azione non può essere annullata.',
            okText: 'Elimina',
            cancelText: 'Annulla',
            okType: 'danger',
            onOk: () => {
                console.log('Eliminando customer con ID:', customerId);

            },
        });

        const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL;
        try {
            const response = await fetch(`${apiBaseUrl}/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
            if (!response.ok) {
                message.error(response.error);
            }

            const data = await response.json();
            setCustomers(data);

            setCustomers(customers.filter(c => c.id !== customerId));
            message.success('Customer eliminato con successo');
        } catch (error) {
            console.error('Errore:', error);
            message.error(error);
        }
    }; 
    
    
    const handleSave = async (values) => {
        if (editingCustomer) {
            // Modifica customer esistente
            setCustomers(customers.map(c =>
                c.id === editingCustomer.id ? { ...c, ...values } : c
            ));
            message.success('Customer aggiornato con successo');
        } else {
            // Aggiunge nuovo customer
            const newCustomer = {
                id: Math.max(...customers.map(c => c.id)) + 1,
                ...values
            };
            setCustomers([...customers, newCustomer]);
            

            const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL;
            const response = await fetch(`${apiBaseUrl}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    address: values.address,
                    city: values.city,
                    country: values.country,
                    zipCode: values.zipCode,
                    phone: values.phoneNumber,
                    fiscalId: values.companyFiscalCode
                })
    
            });
            if(response.ok) {
                message.success('Customer aggiunto con successo');
            } else{
                message.error("Errore durante l'aggiunta del customer");
            }
            
        }
        setDrawerVisible(false);
        setEditingCustomer(null);
        form.resetFields();
    }; 
    
    return (
    <div className="min-h-screen bg-zinc-900  p-6">
        {contextHolder}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-100">Customers</h1>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{
                    backgroundColor: '#14b8a6',
                    borderColor: '#14b8a6',
                    color: '#ffffff'
                }}
            >
                Aggiungi Customer
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{customers.map(customer => (
            <Card
                key={customer.id}
                className="w-full bg-zinc-800 border-zinc-700"
                actions={[
                    <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(customer)}
                        className="text-teal-400 hover:text-teal-300 hover:bg-zinc-700/30"
                    >
                        Modifica
                    </Button>,
                    <Button
                        key="delete"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(customer.id)}
                        className="hover:bg-zinc-700/30"
                    >
                        Elimina
                    </Button>
                ]}
            >
                <Card.Meta
                    title={<span style={{ color: '#000000' }}>{customer.name}</span>}
                    description={
                        <div className="space-y-1">
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Email:</strong> {customer.email}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Indirizzo:</strong> {customer.address}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Città:</strong> {customer.city}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Paese:</strong> {customer.country}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>CAP:</strong> {customer.zipCode}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Codice Fiscale:</strong> {customer.companyFiscalCode}</p>
                            <p style={{ color: '#000000' }}><strong style={{ color: '#000000' }}>Phone:</strong> {customer.phone}</p>
                        </div>
                    }
                />
            </Card>
        ))}
        </div>            <Drawer
            title={<span className="text-zinc-100">{editingCustomer ? 'Modifica Customer' : 'Aggiungi Nuovo Customer'}</span>}
            placement="right"
            width={400}
            onClose={() => {
                setDrawerVisible(false);
                setEditingCustomer(null);
                form.resetFields();
            }}
            open={drawerVisible}
            maskClosable={true}
            styles={{
                header: {
                    backgroundColor: '#27272a',
                    borderBottom: '1px solid #3f3f46',
                    color: '#f4f4f5'
                },
                body: {
                    backgroundColor: '#27272a',
                    color: '#f4f4f5',
                    padding: '24px'
                }, mask: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                },
                wrapper: {
                    backgroundColor: 'transparent'
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
            >
                <Form.Item
                    name="name"
                    label={<span style={{ color: '#f4f4f5' }}>Nome</span>}
                    rules={[{ required: true, message: 'Inserisci il nome' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={<span style={{ color: '#f4f4f5' }}>Email</span>}
                    rules={[
                        { required: true, message: 'Inserisci l\'email' },
                        { type: 'email', message: 'Email non valida' }
                    ]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item
                    name="address"
                    label={<span style={{ color: '#f4f4f5' }}>Indirizzo</span>}
                    rules={[{ required: true, message: 'Inserisci l\'indirizzo' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item
                    name="city"
                    label={<span style={{ color: '#f4f4f5' }}>Città</span>}
                    rules={[{ required: true, message: 'Inserisci la città' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item
                    name="country"
                    label={<span style={{ color: '#f4f4f5' }}>Paese</span>}
                    rules={[{ required: true, message: 'Inserisci il paese' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item
                    name="zipCode"
                    label={<span style={{ color: '#f4f4f5' }}>CAP</span>}
                    rules={[{ required: true, message: 'Inserisci il CAP' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label={<span style={{ color: '#f4f4f5' }}>Numero di Telefono</span>}
                    rules={[{ required: true, message: 'Inserisci il numero di telefono' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>
                <Form.Item
                    name="companyFiscalCode"
                    label={<span style={{ color: '#f4f4f5' }}>Codice Fiscale</span>}
                    rules={[{ required: true, message: 'Inserisci il codice fiscale' }]}
                >
                    <Input style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }} />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                backgroundColor: '#14b8a6',
                                borderColor: '#14b8a6',
                                color: '#ffffff'
                            }}
                        >
                            Salva
                        </Button>
                        <Button
                            onClick={() => {
                                setDrawerVisible(false);
                                setEditingCustomer(null);
                                form.resetFields();
                            }}
                            style={{
                                backgroundColor: '#3f3f46',
                                borderColor: '#52525b',
                                color: '#f4f4f5'
                            }}
                        >
                            Annulla
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Drawer>
    </div>
    );
}

export default Customers;