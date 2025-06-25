import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  message,
  Spin,
  Table,
  Modal,
  Space,
  Tag,
  Empty,
  Select,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "../index.css";
import apiService from "../services/api";
import dayjs from "dayjs";

const { Item } = Form;
const { Option } = Select;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch orders and customers on component mount
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getCustomers();
      console.log("Fetched customers data:", data);

      // Check if data is wrapped in a response object
      const customersList = Array.isArray(data)
        ? data
        : data?.data
        ? data.data
        : data?.customers
        ? data.customers
        : [];

      setCustomers(customersList);
    } catch (error) {
      message.error("Failed to fetch customers: " + error.message);
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      setTableLoading(true);
      const data = await apiService.getOrders();
      console.log("Fetched orders data:", data);

      // Check if data is wrapped in a response object
      const ordersList = Array.isArray(data)
        ? data
        : data?.data
        ? data.data
        : data?.orders
        ? data.orders
        : [];

      console.log("Processed orders list:", ordersList);

      // Ensure each order has required fields
      const validOrders = ordersList.filter(
        (order) => order && typeof order === "object"
      );
      setOrders(validOrders);
    } catch (error) {
      message.error("Failed to fetch orders: " + error.message);
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleCreateOrder = async (values) => {
    setLoading(true);

    try {
      // Format the order data according to the API specification
      const orderData = {
        customerId: values.customerId,
        orderDate: values.requestedDate?.format("YYYY-MM-DD"),
        lots: [
          {
            lotNumber: `LOT-${Date.now()}`, // Generate a unique lot number
            quantity: values.quantityMachines,
          },
        ],
      };

      // Send the order to the API
      const response = await apiService.createOrder(orderData);

      message.success("Order created successfully!");
      form.resetFields();
      setModalVisible(false);
      fetchOrders(); // Refresh the list
      console.log("Created order:", response);
    } catch (error) {
      message.error("Failed to create order: " + error.message);
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this order?",
      content: "This action cannot be undone.",
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          await apiService.deleteOrder(orderId);
          message.success("Order deleted successfully");
          fetchOrders(); // Refresh the list
        } catch (error) {
          message.error("Failed to delete order: " + error.message);
          console.error("Error deleting order:", error);
        }
      },
    });
  };

  // Calculate total quantity from lots or quantityMachines field
  const getTotalQuantity = (order) => {
    // First check if quantityMachines is directly on the order
    if (order.quantityMachines) {
      return order.quantityMachines;
    }
    // Otherwise check lots array
    if (!order.lots || !Array.isArray(order.lots)) return 0;
    return order.lots.reduce((sum, lot) => sum + (lot.quantity || 0), 0);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Customer",
      dataIndex: "customerId",
      key: "customerId",
      width: 200,
      render: (customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer
          ? `${customer.name} (ID: ${customerId})`
          : `Customer ID: ${customerId}`;
      },
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 150,
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Total Quantity",
      key: "totalQuantity",
      width: 130,
      render: (_, record) => getTotalQuantity(record),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      width: 150,
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        // Determine status based on fulfilledDate
        const status =
          record.fullfilledDate || record.fullfiledDate
            ? "Completed"
            : "Pending";
        const color = status === "Completed" ? "green" : "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() =>
              message.info(`View order ${record.id} - Coming soon!`)
            }
            style={{ color: "#14b8a6" }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteOrder(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 w-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Orders</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{
            backgroundColor: "#14b8a6",
            borderColor: "#14b8a6",
            color: "#ffffff",
          }}
        >
          Create Order
        </Button>
      </div>

      <div className="bg-zinc-800 rounded-lg p-4">
        <Table
          columns={columns}
          dataSource={orders}
          loading={tableLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No orders found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          style={{
            "--ant-table-bg": "transparent",
            "--ant-table-header-bg": "#27272a",
            "--ant-table-header-color": "#f4f4f5",
            "--ant-table-body-bg": "#18181b",
            "--ant-table-row-hover-bg": "#27272a",
          }}
        />
      </div>

      <Modal
        title="Create New Order"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Spin spinning={loading} tip="Creating order...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateOrder}
            initialValues={{
              customerId: null,
              quantityMachines: null,
              requestedDate: null,
              fullfiledDate: null,
              deadline: null,
            }}
          >
            <Item
              label={<span style={{ color: "#18181b" }}>Customer</span>}
              name="customerId"
              rules={[{ required: true, message: "Please select a customer" }]}
            >
              <Select
                className="w-full"
                placeholder="Select a customer"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </Option>
                ))}
              </Select>
            </Item>

            <Item
              label={
                <span style={{ color: "#18181b" }}>Quantity Machines</span>
              }
              name="quantityMachines"
              rules={[{ required: true, message: "Please input quantity" }]}
            >
              <InputNumber
                className="w-full"
                placeholder="Enter quantity"
                min={1}
              />
            </Item>

            <Item
              label={<span style={{ color: "#18181b" }}>Requested Date</span>}
              name="requestedDate"
              rules={[
                { required: true, message: "Please select requested date" },
              ]}
            >
              <DatePicker
                showTime
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                placeholder="Select requested date"
              />
            </Item>

            <Item
              label={<span style={{ color: "#18181b" }}>Fulfilled Date</span>}
              name="fullfiledDate"
            >
              <DatePicker
                showTime
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                placeholder="Select fulfilled date (optional)"
              />
            </Item>

            <Item
              label={<span style={{ color: "#18181b" }}>Deadline</span>}
              name="deadline"
              rules={[{ required: true, message: "Please select deadline" }]}
            >
              <DatePicker
                showTime
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                placeholder="Select deadline"
              />
            </Item>

            <Item>
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#14b8a6",
                    borderColor: "#14b8a6",
                  }}
                >
                  Submit Order
                </Button>
              </Space>
            </Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default Orders;
