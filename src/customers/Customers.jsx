import React, { useState } from 'react';
import { Card, Button, Drawer, Form, Input, Modal, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Customers = () => {
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: 'John Doe',
            email: 'ciao@pippo.it',
            address: '123 Main St, Springfield',
            country: 'USA',
            zipCode: '12345',
            city: 'Springfield',
            companyFiscalCode: '12345678901',
        },
        {
            id: 2,
            name: 'Matteo Siciliano',
            email: 'ciao@pippo.it',
            address: 'Via vittorio emanuele 123, Palermo',
            country: 'Italy',
            zipCode: '12345',
            city: 'Palermo',
            companyFiscalCode: '12345678901',
        },
    ]); const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue(customer);
        setDrawerVisible(true);
    }; const handleDelete = (customerId) => {
        console.log('handleDelete chiamata con ID:', customerId);
        modal.confirm({
            title: 'Sei sicuro di voler eliminare questo customer?',
            content: 'Questa azione non può essere annullata.',
            okText: 'Elimina',
            cancelText: 'Annulla',
            okType: 'danger',
            onOk: () => {
                console.log('Eliminando customer con ID:', customerId);
                setCustomers(customers.filter(c => c.id !== customerId));
                message.success('Customer eliminato con successo');
            },
        });
    };

    const handleSave = (values) => {
        setCustomers(customers.map(c =>
            c.id === editingCustomer.id ? { ...c, ...values } : c
        ));
        setDrawerVisible(false);
        setEditingCustomer(null);
        form.resetFields();
        message.success('Customer aggiornato con successo');
    }; return (
        <div className="min-h-screen bg-zinc-900 w-screen p-6">
            {contextHolder}
            <h1 className="text-2xl font-bold mb-6 text-zinc-100">Customers</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">                {customers.map(customer => (
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
                            </div>
                        }
                    />
                </Card>
            ))}
            </div>
            <Drawer
                title={<span className="text-zinc-100">Modifica Customer</span>}
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