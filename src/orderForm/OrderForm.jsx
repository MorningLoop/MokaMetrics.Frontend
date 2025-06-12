import { Button, Form, InputNumber, DatePicker } from 'antd';
import { useState } from 'react';
import '../index.css'
const { Item } = Form;
const OrderForm = () => {
  const [form] = Form.useForm();
  const [customerId, setCustomerId] = useState(1);

  const onFinish = (values) => {
    const formatted = {
      customerId: customerId,
      quantityMachines: values.quantityMachines,
      requestedDate: values.requestedDate?.toISOString(),
      fullfiledDate: values.fullfiledDate?.toISOString(),
      deadline: values.deadline?.toISOString(),
    };
    console.log("Submitted order:", formatted);
  };
  return (
    <div className="min-h-screen flex items-center w-screen justify-center bg-zinc-900 p-6">
      <div className="w-full max-w-xl bg-zinc-800 rounded-2xl shadow-lg p-8 border border-zinc-700">
        <h2 className="text-2xl font-semibold text-center text-zinc-100 mb-6">Order Form</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            quantityMachines: null,
            requestedDate: null,
            fullfiledDate: null,
            deadline: null,
          }}
        >
          <div className="flex flex-col ju">
            <div className="flex w-full ">              <Item
                label={<span style={{ color: '#f4f4f5' }}>Quantity Machines</span>}
                name="quantityMachines"
                rules={[{ required: true, message: "Please input quantity" }]}
              >
                <InputNumber
                  className="w-full text-white placeholder-white"
                  style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }}
                  placeholder="Enter quantity"
                />
              </Item>

              <Item
                label={<span style={{ color: '#f4f4f5' }}>Requested Date</span>}
                name="requestedDate"
                rules={[{ required: true, message: "Please select requested date" }]}
              >
                <DatePicker
                  showTime
                  className="w-full text-white placeholder-white"
                  format="YYYY-MM-DD HH:mm"
                  style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }}
                  placeholder="Select requested date"
                />
              </Item>
            </div>            <Item label={<span style={{ color: '#f4f4f5' }}>Fulfilled Date</span>} name="fullfiledDate">
              <DatePicker
                showTime
                className="w-full text-white placeholder-white"
                format="YYYY-MM-DD HH:mm"
                style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }}
                placeholder="Select fulfilled date"
              />
            </Item>

            <Item
              label={<span style={{ color: '#f4f4f5' }}>Deadline</span>}
              name="deadline"
              rules={[{ required: true, message: "Please select deadline" }]}
            >
              <DatePicker
                showTime
                className="w-full text-white placeholder-white"
                format="YYYY-MM-DD HH:mm"
                style={{ backgroundColor: '#3f3f46', borderColor: '#52525b', color: '#f4f4f5' }}
                placeholder="Select deadline"
              />
            </Item>            <Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full text-white"
                style={{
                  backgroundColor: '#14b8a6',
                  borderColor: '#14b8a6',
                  color: '#ffffff'
                }}
              >
                Submit Order
              </Button>
            </Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default OrderForm;