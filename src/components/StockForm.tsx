import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { Stock } from '../types/stock';

interface StockFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<Stock, 'id'>) => void;
  initialValues?: Stock | null;
}

const StockForm: React.FC<StockFormProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      stockName: values.stockName,
      stockCode: values.stockCode,
      currentPrice: values.currentPrice,
    });
  };

  return (
    <Modal
      title={initialValues ? '编辑股票' : '新增股票'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="stockName"
          label="股票名称"
          rules={[{ required: true, message: '请输入股票名称' }]}
        >
          <Input placeholder="例如：贵州茅台" />
        </Form.Item>
        <Form.Item
          name="stockCode"
          label="股票代码"
          rules={[{ required: true, message: '请输入股票代码' }]}
        >
          <Input placeholder="例如：600519" />
        </Form.Item>
        <Form.Item
          name="currentPrice"
          label="当前价格"
          rules={[{ required: true, message: '请输入当前价格' }]}
        >
          <InputNumber min={0} precision={2} step={0.01} style={{ width: '100%' }} prefix="¥" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockForm;
