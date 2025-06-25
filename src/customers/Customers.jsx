import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  message,
  Space,
  Spin,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import apiService from "../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    console.log("Starting fetchCustomers...");
    try {
      setTableLoading(true);
      console.log("Making API call to getCustomers...");
      const data = await apiService.getCustomers();
      console.log("Fetched customers data:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));

      // Check if data is wrapped in a response object
      const customersList = Array.isArray(data)
        ? data
        : data?.data
        ? data.data
        : data?.customers
        ? data.customers
        : [];

      console.log("Processed customers list:", customersList);
      console.log("Customers list length:", customersList.length);

      // Ensure each customer has required fields and map fiscalId to companyFiscalCode for UI compatibility
      const validCustomers = customersList
        .filter((customer) => customer && typeof customer === "object")
        .map((customer) => ({
          ...customer,
          companyFiscalCode: customer.fiscalId || customer.companyFiscalCode,
          phone: customer.phone || "", // Add phone field if missing
        }));

      console.log("Valid customers after processing:", validCustomers);
      console.log(
        "Setting customers state with:",
        validCustomers.length,
        "customers"
      );
      setCustomers(validCustomers);
    } catch (error) {
      console.error("Error in fetchCustomers:", error);
      message.error("Failed to fetch customers: " + error.message);
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      console.log("Setting tableLoading to false");
      setTableLoading(false);
    }
  };
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setDrawerVisible(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleDelete = async (customerId) => {
    console.log("handleDelete chiamata con ID:", customerId);
    modal.confirm({
      title: "Sei sicuro di voler eliminare questo customer?",
      content: "Questa azione non può essere annullata.",
      okText: "Elimina",
      cancelText: "Annulla",
      okType: "danger",
      onOk: async () => {
        try {
          console.log("Eliminando customer con ID:", customerId);
          await apiService.deleteCustomer(customerId);
          message.success("Customer eliminato con successo");
          fetchCustomers(); // Refresh the list
        } catch (error) {
          message.error("Failed to delete customer: " + error.message);
          console.error("Error deleting customer:", error);
        }
      },
    });
  };
  const handleSave = async (values) => {
    setLoading(true);

    try {
      // Map companyFiscalCode to fiscalId for API compatibility
      const customerData = {
        ...values,
        fiscalId: values.companyFiscalCode,
      };

      // Remove companyFiscalCode from the data sent to API
      delete customerData.companyFiscalCode;

      if (editingCustomer) {
        // Update existing customer
        await apiService.updateCustomer(editingCustomer.id, {
          id: editingCustomer.id,
          ...customerData,
        });
        message.success("Customer aggiornato con successo");
      } else {
        // Create new customer
        await apiService.createCustomer(customerData);
        message.success("Customer aggiunto con successo");
      }

      setDrawerVisible(false);
      setEditingCustomer(null);
      form.resetFields();
      fetchCustomers(); // Refresh the list
    } catch (error) {
      message.error("Failed to save customer: " + error.message);
      console.error("Error saving customer:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-900 w-screen p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Customers</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{
            backgroundColor: "#14b8a6",
            borderColor: "#14b8a6",
            color: "#ffffff",
          }}
        >
          Aggiungi Customer
        </Button>
      </div>
      <Spin spinning={tableLoading} tip="Loading customers...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
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
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <span style={{ color: "#000000" }}>{customer.name}</span>
                }
                description={
                  <div className="space-y-1">
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>Email:</strong>{" "}
                      {customer.email}
                    </p>
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>Indirizzo:</strong>{" "}
                      {customer.address}
                    </p>
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>Città:</strong>{" "}
                      {customer.city}
                    </p>
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>Paese:</strong>{" "}
                      {customer.country}
                    </p>
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>CAP:</strong>{" "}
                      {customer.zipCode}
                    </p>
                    {customer.phone && (
                      <p style={{ color: "#000000" }}>
                        <strong style={{ color: "#000000" }}>Telefono:</strong>{" "}
                        {customer.phone}
                      </p>
                    )}
                    <p style={{ color: "#000000" }}>
                      <strong style={{ color: "#000000" }}>
                        Codice Fiscale:
                      </strong>{" "}
                      {customer.companyFiscalCode || customer.fiscalId}
                    </p>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      </Spin>{" "}
      <Drawer
        title={
          <span className="text-zinc-100">
            {editingCustomer ? "Modifica Customer" : "Aggiungi Nuovo Customer"}
          </span>
        }
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
            backgroundColor: "#27272a",
            borderBottom: "1px solid #3f3f46",
            color: "#f4f4f5",
          },
          body: {
            backgroundColor: "#27272a",
            color: "#f4f4f5",
            padding: "24px",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
          wrapper: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Spin spinning={loading} tip="Saving customer...">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="name"
              label={<span style={{ color: "#f4f4f5" }}>Nome</span>}
              rules={[{ required: true, message: "Inserisci il nome" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ color: "#f4f4f5" }}>Email</span>}
              rules={[
                { required: true, message: "Inserisci l'email" },
                { type: "email", message: "Email non valida" },
              ]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={<span style={{ color: "#f4f4f5" }}>Indirizzo</span>}
              rules={[{ required: true, message: "Inserisci l'indirizzo" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="city"
              label={<span style={{ color: "#f4f4f5" }}>Città</span>}
              rules={[{ required: true, message: "Inserisci la città" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="country"
              label={<span style={{ color: "#f4f4f5" }}>Paese</span>}
              rules={[{ required: true, message: "Inserisci il paese" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="zipCode"
              label={<span style={{ color: "#f4f4f5" }}>CAP</span>}
              rules={[{ required: true, message: "Inserisci il CAP" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span style={{ color: "#f4f4f5" }}>Telefono</span>}
              rules={[{ required: true, message: "Inserisci il telefono" }]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item
              name="companyFiscalCode"
              label={<span style={{ color: "#f4f4f5" }}>Codice Fiscale</span>}
              rules={[
                { required: true, message: "Inserisci il codice fiscale" },
              ]}
            >
              <Input
                style={{
                  backgroundColor: "#3f3f46",
                  borderColor: "#52525b",
                  color: "#f4f4f5",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#14b8a6",
                    borderColor: "#14b8a6",
                    color: "#ffffff",
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
                    backgroundColor: "#3f3f46",
                    borderColor: "#52525b",
                    color: "#f4f4f5",
                  }}
                >
                  Annulla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
    </div>
  );
};

export default Customers;
