import { Button, Popconfirm, Col, Divider, Form, Input, Layout, Modal, Row, Space, Table } from "antd";
import Highlighter from 'react-highlight-words';
import {
  ScanOutlined
} from '@ant-design/icons';

import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  BarcodeOutlined,
  MinusCircleOutlined,
  ImportOutlined
} from '@ant-design/icons';

import styles from '../../../../styles/app.module.scss';
import React, { useState } from "react";
import { TableHead } from "@material-ui/core";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../../../services/axios";
import { Notification } from "../../../../components/Notification";
import { api } from "../../../../services/api";
import Title from "antd/lib/typography/Title";

export default function UpdateProductionOrdersBySAP() {
  const [updatedProductionOrders, setUpdatedProductionOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const modalColumns = [
    {
      title: 'Número da OP',
      dataIndex: 'document_number',
      key: 'document_number',
      width: '20%',
    },
    {
      title: 'Estrutura',
      dataIndex: 'item_description',
      key: 'item_description',
      width: '80%',
    },
  ];

  async function handleClose() {
    setIsModalOpen(false);

    return;
  }

  async function handleSave() {
    await createProductionOrdersBySAP();

    setIsModalOpen(false);

    Notification({
      type: 'success',
      title: 'OK',
      description: `${updatedProductionOrders.length} OP adicionadas!`,
    })

    return;
  }

  async function createProductionOrdersBySAP() {
    setIsLoading(true);

    try {
      const productionOrders = await api.post(`/sap/production-order`);

      console.log(productionOrders);

      setUpdatedProductionOrders([...updatedProductionOrders, productionOrders]);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      console.error(error.response.data.message);

      Notification({
        type: 'error',
        title: 'Erro de importação',
        description: `${error.response.data.message}`,
      })
    }
  }

  return (
    <div>
      <Layout>
        <Row justify="center">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<ImportOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Atualizar OPs
            </Button>
          </Col>
        </Row>
      </Layout>
      <Modal
        width={900}
        title="Atualização de Ordem de Produção"
        visible={isModalOpen}
        footer={[
          <Button key="back" type="default" onClick={handleClose}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSave}
            loading={isLoading}
          >
            Atualizar
          </Button>,
        ]}
      >
        <Row>
          <Col span={7}>
            <Form.Item
              key="updatedProductionOderNumber"
              labelCol={{ span: 23 }}
              label="Quantidade de OPs atualizadas"
              style={{
                fontWeight: 'bold',
              }}
            >
              <Input
                type="number"
                key="totalKey"
                size="large"
                disabled={true}
                value={updatedProductionOrders.length.toString()}
              />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </div>
  )

}