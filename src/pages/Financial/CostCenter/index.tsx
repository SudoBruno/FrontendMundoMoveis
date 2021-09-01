import React, { FormEvent, useState } from 'react';

import {
  Button,
  Col,
  Form,
  Input,
  Select,
  Modal,
  Row,
  Popover,
  Table,
  Popconfirm,
  Space,
  Layout,
} from 'antd';
import { GetServerSideProps } from 'next';
import { Notification } from '../../../components/Notification';
import { getAPIClient } from '../../../services/axios';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { api } from '../../../services/api';

const { Option } = Select;

export default function CenterCost() {
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [centerCostId, setCenterCostId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<any>('');

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
  }

  async function handleClose() {
    setIsModalOpen(false);
    setCenterCostId('');
    setName('');
    setCode('');
  }

  return (
    <Modal
      title="Cadastro de Plano de Conta"
      width={1100}
      visible={isOpenModal}
      onCancel={() => {
        handleClose();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            handleClose();
          }}
          type="default"
        >
          Cancelar
        </Button>,
        <Button
          key="submit"
          loading={loading}
          type="primary"
          onClick={handleRegister}
        >
          Salvar
        </Button>,
      ]}
    >
      <Row gutter={5}>
        <Col span={7}>
          <Form.Item
            key="nameFormItem"
            labelCol={{ span: 20 }}
            label="Nome da Conta:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Input
              key="nameKey"
              size="large"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={5}>
        <Col span={7}>
          <Form.Item
            key="nameFormItem"
            labelCol={{ span: 20 }}
            label="Limite de Compra (R$):"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Input
              type="number"
              key="quantiyKey"
              size="large"
              style={{ width: '80%', marginRight: '2%' }}
              value={''}
              onChange={(e) => {
                console.log(Number(e.target.value));
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Modal>
  );
}
