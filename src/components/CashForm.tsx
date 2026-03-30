import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';
import type { CashTransaction, CashTransactionType } from '../types/stock';

interface CashFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<CashTransaction, 'id'>) => void;
  initialValues?: CashTransaction | null;
}

const CashForm: React.FC<CashFormProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          type: initialValues.type,
          amount: initialValues.amount,
          transactionDate: dayjs(initialValues.transactionDate),
          note: initialValues.note,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'deposit' });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      type: values.type as CashTransactionType,
      amount: values.amount,
      transactionDate: values.transactionDate.format('YYYY-MM-DD'),
      note: values.note || '',
    });
  };

  return (
    <Modal
      title={initialValues ? '编辑现金记录' : '现金操作'}
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
          label="操作类型"
          rules={[{ required: true, message: '请选择操作类型' }]}
        >
          <Select>
            <Select.Option value="deposit">存入</Select.Option>
            <Select.Option value="withdraw">取出</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="金额"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber min={0.01} precision={2} step={100} style={{ width: '100%' }} prefix="$" />
        </Form.Item>

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

export default CashForm;
