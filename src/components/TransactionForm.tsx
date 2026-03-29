import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';
import type { Transaction, TransactionType } from '../types/stock';

interface TransactionFormProps {
  open: boolean;
  stockId: number;
  onCancel: () => void;
  onSubmit: (values: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ open, stockId, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const txType = Form.useWatch('type', form) as TransactionType | undefined;

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ type: 'buy' });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const type: TransactionType = values.type;
    const isDividend = type === 'dividend';

    const price = isDividend ? 0 : values.price;
    const quantity = isDividend ? 0 : values.quantity;
    const amount = isDividend ? values.amount : price * quantity;

    onSubmit({
      stockId,
      type,
      price,
      quantity,
      amount,
      transactionDate: values.transactionDate.format('YYYY-MM-DD'),
      note: values.note || '',
    });
  };

  const isDividend = txType === 'dividend';

  return (
    <Modal
      title="添加交易"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="type"
          label="交易类型"
          rules={[{ required: true, message: '请选择交易类型' }]}
        >
          <Select>
            <Select.Option value="buy">买入</Select.Option>
            <Select.Option value="sell">卖出</Select.Option>
            <Select.Option value="dividend">分红</Select.Option>
          </Select>
        </Form.Item>

        {!isDividend && (
          <>
            <Form.Item
              name="price"
              label="价格"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <InputNumber min={0.01} precision={2} step={0.01} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="数量（股）"
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={1} precision={0} step={100} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}

        {isDividend && (
          <Form.Item
            name="amount"
            label="分红金额"
            rules={[{ required: true, message: '请输入分红金额' }]}
          >
            <InputNumber min={0.01} precision={2} step={1} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
        )}

        <Form.Item
          name="transactionDate"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="note" label="备注">
          <Input.TextArea rows={2} placeholder="可选" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransactionForm;
